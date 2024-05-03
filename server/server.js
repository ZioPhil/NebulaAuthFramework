require('dotenv').config();

const fileupload = require("express-fileupload");
const callExternalApi = require("./external-api.service")
const callUuidGenerator = require("./uuid-generation")
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
const { expressjwt: jwt } = require("express-jwt");
const mysql = require('mysql2/promise');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8000;
let connection;

const nebulaApiServerUrl = process.env.VITE_NEBULA_API_ADDRESS;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());

// enviroment variables in .env file
const authConfig = {
  domain: process.env.VITE_AUTH0_DOMAIN,
  audience: process.env.VITE_AUTH0_AUDIENCE,
};

// JSON Web Token validation
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  // Authentication token validation
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

// Admin permission validation
const checkPermissions = jwtAuthz([ "manage:users" ], { customScopeKey: "permissions", customUserKey: 'auth' });

// Connect to DB and start server
async function startServer(){
  connection = await mysql.createConnection({
    host: process.env.VITE_DB_ADDRESS,
    user: process.env.VITE_DB_USER,
    password: process.env.VITE_DB_PASSWORD,
    database: 'srs',
    port: process.env.VITE_DB_PORT,
  });
  console.log("Connected to MySQL database")
  app.listen(port)
  console.log("Server listening on port " + port)
}

// TODO: add logs

// get all users
app.post('/users', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received users request")
  const groupId = req.body.role
  const counter = req.body.counter
  const query1 = "SELECT * FROM Users ORDER BY Email LIMIT 50 OFFSET " + counter + ";"

  try {
    const [users] = await connection.query(query1);
    if (users.length === 0) {
      res.status(404).send("No more users")
      return
    }

    for (let i = 0; i < users.length; i++) {
      const query2 = "SELECT * FROM UserUserGroups WHERE user_ID='" + users[i].ID + "' AND group_ID='" + groupId + "';"
      const [results] = await connection.query(query2);
      users[i].hasRole = results.length !== 0;
    }
    res.send(users)
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while fetching users on server")
  }
});

//add new user to database
app.post('/addUser', checkJwt, async (req, res) => {
  console.log("Received add user request")
  const userId = req.auth.sub
  //check if the user is already in the database, this is done to prevent the exploitation of this call
  const query1 = "SELECT * FROM Users WHERE ID='" + userId + "';"
  try {
    const [results] = await connection.query(query1);
    if (results.length !== 0) {
      res.status(409).send("The user already exists on DB")
    }
    else {
      console.log(req)
      const email = req.body.email
      const query2 = "INSERT INTO Users VALUES ('" + userId + "', '" + email + "');"
      await connection.query(query2);
      res.send(true)
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while adding user to DB on server")
  }
});

//get all roles
app.post('/roles', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received roles request")
  const counter = req.body.counter;
  const { id, error } = await callUuidGenerator();
  if (id) {
    const query = "SELECT * FROM UserGroups ORDER BY Name LIMIT 50 OFFSET " + counter + ";"
    try {
      const [results] = await connection.query(query);
      if (results.length === 0) {
        res.status(404).send("No more roles")
        return
      }
      res.send(results)
      return
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while adding role to DB on server")
      return
    }
  }
  if (error) {
    res.status(500).send("Error while generating uuid for role")
  }
});

// update users for role
app.post('/updateRoleUsers', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received update role users request")
  const roleId = req.body.roleId
  const userId = req.body.userId
  const value = req.body.value

  if (value) {
    const query = "INSERT INTO UserUserGroups VALUES ('" + roleId + "', '" + userId + "');"
    try {
      await connection.query(query);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while adding user to group to DB on server")
    }
  }
  else {
    const query = "DELETE FROM UserUserGroups WHERE group_ID='" + roleId + "' AND user_ID='" + userId + "';"
    try {
      await connection.query(query);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while removing user from group from DB on server")
    }
  }
});

// update machines for role
app.post('/updateRoleMachines', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received update role machines request")
  const roleId = req.body.roleId
  const machineId = req.body.machineId
  const value = req.body.value

  if (value) {
    const query = "INSERT INTO MachineUserGroups VALUES ('" + machineId + "', '" + roleId + "');"
    try {
      await connection.query(query);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while adding machine to group to DB on server")
    }
  }
  else {
    const query = "DELETE FROM MachineUserGroups WHERE machine_ID='" + machineId + "' AND group_ID='" + roleId + "';"
    try {
      await connection.query(query);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while removing machine from group from DB on server")
    }
  }
});

// create new role
app.post('/createRole', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received create role request")
  const roleName = req.body.name
  const { id, error } = await callUuidGenerator();
  if (id) {
    const query = "INSERT INTO UserGroups VALUES ('" + id + "', '" + roleName + "');"
    try {
      await connection.query(query);
      res.send(true)
      return
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while adding role to DB on server")
      return
    }
  }
  if (error) {
    console.log(error)
    res.status(500).send("Error while generating uuid for role on server")
  }
});

// delete role
app.post('/deleteRole', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received delete role request")
  const roleId = req.body.roleId
  const query1 = "DELETE FROM UserGroups WHERE ID='" + roleId + "';"
  const query2 = "DELETE FROM MachineUserGroups WHERE group_ID='" + roleId + "';"
  const query3 = "DELETE FROM UserUserGroups WHERE group_ID='" + roleId + "';"
  try {
    await connection.query(query1);
    await connection.query(query2);
    await connection.query(query3);
    res.send(true)
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while removing role from DB on server")
  }
});

// get machines available to the user
app.post('/machinesNormal', checkJwt, async (req, res) => {
  console.log("Received machines request")
  const counter = req.body.counter;

  if (req.auth.permissions.includes('manage:users')) {
    const query = "SELECT * FROM Machines ORDER BY Name LIMIT 50 OFFSET " + counter + ";"
    try {
      const [machines] = await connection.query(query);
      if (machines.length === 0) {
        res.status(404).send("No more machines")
        return
      }
      res.send(machines)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while fetching machines from DB on server")
    }
  }
  else {
    const query =
      "SELECT M.* FROM Machines M WHERE M.ID IN (" +
      "SELECT JM.machine_ID from MachineUserGroups JM WHERE JM.group_ID IN (" +
      "SELECT JU.group_ID FROM UserUserGroups JU WHERE JU.user_ID='" + req.auth.sub + "')) ORDER BY M.Name LIMIT 50 OFFSET " + counter + ";"

    try {
      const [machines] = await connection.query(query);
      if (machines.length === 0) {
        res.status(403).send("You don't have access to any machine")
      }
      else {
        res.send(machines)
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while fetching machines from DB on server")
    }
  }
});

// get all machines
app.post('/machinesAdmin', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received machines admin request")
  const groupId = req.body.role
  const counter = req.body.counter
  const query1 = "SELECT * FROM Machines ORDER BY Name LIMIT 50 OFFSET " + counter + ";"
  try {
    const [machines] = await connection.query(query1);
    if (machines.length === 0) {
      res.status(404).send("No more machines")
      return
    }
    for (let i = 0; i < machines.length; i++) {
      const query2 = "SELECT * FROM MachineUserGroups WHERE machine_ID='" + machines[i].ID + "' AND group_ID='" + groupId + "';"
      const [results] = await connection.query(query2);
      machines[i].isAvailable = results.length !== 0;
    }
    res.send(machines)
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while fetching machines from DB on server")
  }
});

// generate certificate for a given machine
app.post('/generateCertificate', checkJwt, async (req, res) => {
  console.log("Received certificate generation request")
  const key = req.body.key
  const id = req.body.id
  const name = req.body.name
  const ip_address = req.body.ip_address
  const groups = req.body.groups

  // if the user is not an admin, check if he can access the machine
  if (!req.auth.permissions.includes('manage:users')) {
    const query = "SELECT MA.* FROM Machines MA WHERE MA.ID='" + id + "' AND MA.Name='" + name + "' AND MA.ID IN (" +
      "SELECT M.machine_ID FROM MachineUserGroups M WHERE M.machine_ID='" + id + "' AND M.group_ID IN (" +
      "SELECT U.group_ID FROM UserUserGroups U WHERE U.user_ID='" + req.auth.sub + "'));"
    try {
      const [results] = await connection.query(query);
      if (results.length === 0) {
        res.status(403).send("You can't access this machine")
        return
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while reading DB on server")
      return
    }
  }

  const formData = new FormData();
  formData.append("key", key);
  formData.append("name", name);
  formData.append("ip_address", ip_address);
  formData.append("groups", groups);

  const config = {
    url: `${nebulaApiServerUrl}/generate_certificate`,
    method: "POST",
    headers: {
      "content-type": "multipart/form-data",
    },
    data: formData,
  };

  const { data, error } = await callExternalApi({ config });

  if (data) {
    res.send(data)
    return
  }
  if (error) {
    res.status(500).send("Error while generating certificate")
  }
})

app.get('/', (req, res) => {
  console.log("Received hello request")
  res.send(`Server listening on port ${port}`)
});

startServer();