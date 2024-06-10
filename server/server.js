require('dotenv').config();

const fs = require('fs')
const https = require ('https')
const fileupload = require("express-fileupload");
const callExternalApi = require("./external-api.service")
const callUuidGenerator = require("./uuid-generation")
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
const { expressjwt: jwt } = require("express-jwt");
const mysql = require('mysql2/promise');

const express = require('express');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8000;
let connection;

const nebulaApiServerUrl = process.env.VITE_NEBULA_API_ADDRESS;

// TODO: limiter response doesn't get handled well on client
// set rate limit for requests to prevent DoS attacks
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // max 100 requests per windowMs
});
app.use(limiter); // apply limiter to all requests

app.use(bodyParser.json());
app.use(cors({origin: 'https://srsproject.top'}));
app.set('trust proxy', 1);
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

// Create https agent to connect to python api
const ca = fs.readFileSync("cert.pem")
const httpsAgent = new https.Agent({ca: ca,});

// load server certificate
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

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
  https.createServer(options, app).listen(port);
  console.log("Server listening on port " + port)
}

// TODO: add logs

// get all users
app.post('/server/users', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received users request")
  const groupId = req.body.role
  const counter = req.body.counter
  const value = req.body.value

  let query1 = "SELECT * FROM Users"
  let inserts = []
  if (value !== "") {
    query1 += (" WHERE Email LIKE ?")
    inserts.push(value+"%")
  }
  query1 += (" ORDER BY Email LIMIT 50 OFFSET ?;")
  inserts.push(counter) // using placeholder to prevent SQL Injection attack

  try {
    const [users] = await connection.query(query1, inserts);
    if (users.length === 0 && counter !== 0) {
      res.status(404).send("No more users")
      return
    }
    else if (users.length === 0 && counter === 0 && value !== "") {
      res.status(404).send("No users with that name")
      return
    }

    for (let i = 0; i < users.length; i++) {
      const query2 = "SELECT * FROM UserUserGroups WHERE user_ID=? AND group_ID=?;"
      let inserts = [users[i].ID, groupId] // using placeholder to prevent SQL Injection attack

      const [results] = await connection.query(query2, inserts);
      users[i].hasRole = results.length !== 0;
    }
    res.send(users)
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while fetching users on server")
  }
});

//add new user to database
app.post('/server/addUser', checkJwt, async (req, res) => {
  console.log("Received add user request")
  const userId = req.auth.sub
  //check if the user is already in the database, this is done to prevent the exploitation of this call
  const query1 = "SELECT * FROM Users WHERE ID=?;"
  let inserts = [userId] // using placeholder to prevent SQL Injection attack

  try {
    const [results] = await connection.query(query1, inserts);
    if (results.length !== 0) {
      res.status(409).send("The user already exists on DB")
    }
    else {
      const email = req.body.email
      const query2 = "INSERT INTO Users VALUES (?, ?);"
      let inserts = [userId, email] // using placeholder to prevent SQL Injection attack

      await connection.query(query2, inserts);
      res.send(true)
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while adding user to DB on server")
  }
});

//get all roles
app.post('/server/roles', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received roles request")
  const counter = req.body.counter;
  const value = req.body.value;
  let query = "SELECT * FROM UserGroups"
  let inserts = [] // using placeholder to prevent SQL Injection attack

  if (value !== "") {
    query += (" WHERE Name LIKE ?")
    inserts.push(value+"%")
  }
  query += (" ORDER BY Name LIMIT 50 OFFSET ?;")
  inserts.push(counter)

  try {
    const [results] = await connection.query(query, inserts);
    if (results.length === 0 && counter !== 0) {
      res.status(404).send("No more roles")
      return
    }
    else if (results.length === 0 && counter === 0 && value !== "") {
      res.status(404).send("No roles with that name")
      return
    }

    res.send(results)
    return
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while adding role to DB on server")
    return
  }
});

// update users for role
app.post('/server/updateRoleUsers', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received update role users request")
  const roleId = req.body.roleId
  const userId = req.body.userId
  const value = req.body.value

  if (value) {
    const query = "INSERT INTO UserUserGroups VALUES (?, ?);"
    let inserts = [roleId, userId] // using placeholder to prevent SQL Injection attack

    try {
      await connection.query(query, inserts);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while adding user to group to DB on server")
    }
  }
  else {
    const query = "DELETE FROM UserUserGroups WHERE group_ID=? AND user_ID=?;"
    let inserts = [roleId, userId] // using placeholder to prevent SQL Injection attack

    try {
      await connection.query(query, inserts);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while removing user from group from DB on server")
    }
  }
});

// update machines for role
app.post('/server/updateRoleMachines', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received update role machines request")
  const roleId = req.body.roleId
  const machineId = req.body.machineId
  const value = req.body.value

  if (value) {
    const query = "INSERT INTO MachineUserGroups VALUES (?, ?);"
    let inserts = [machineId, roleId] // using placeholder to prevent SQL Injection attack

    try {
      await connection.query(query, inserts);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while adding machine to group to DB on server")
    }
  }
  else {
    const query = "DELETE FROM MachineUserGroups WHERE machine_ID=? AND group_ID=?;"
    let inserts = [machineId, roleId] // using placeholder to prevent SQL Injection attack

    try {
      await connection.query(query, inserts);
      res.send(true)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while removing machine from group from DB on server")
    }
  }
});

// create new role
app.post('/server/createRole', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received create role request")
  const roleName = req.body.name
  const { id, error } = await callUuidGenerator();
  if (id) {
    const query = "INSERT INTO UserGroups VALUES (?, ?);"
    let inserts = [id, roleName] // using placeholder to prevent SQL Injection attack

    try {
      await connection.query(query, inserts);
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
app.post('/server/deleteRole', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received delete role request")
  const roleId = req.body.roleId
  const query1 = "DELETE FROM MachineUserGroups WHERE group_ID=?;"
  const query2 = "DELETE FROM UserUserGroups WHERE group_ID=?;"
  const query3 = "DELETE FROM UserGroups WHERE ID=?;"
  let inserts = [roleId] // using placeholder to prevent SQL Injection attack

  try {
    await connection.query(query1, inserts);
    await connection.query(query2, inserts);
    await connection.query(query3, inserts);
    res.send(true)
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while removing role from DB on server")
  }
});

// get machines available to the user
app.post('/server/machinesNormal', checkJwt, async (req, res) => {
  console.log("Received machines request")
  const counter = req.body.counter;
  const value = req.body.value;

  if (req.auth.permissions.includes('manage:users')) {
    let query = "SELECT * FROM Machines"
    let inserts = [] // using placeholder to prevent SQL Injection attack
    if (value !== "") {
      query += (" WHERE Name LIKE ?")
      inserts.push(value+"%")
    }
    query += (" ORDER BY Name LIMIT 50 OFFSET ?;")
    inserts.push(counter)

    try {
      const [machines] = await connection.query(query, inserts);
      if (machines.length === 0 && counter !== 0) {
        res.status(404).send("No more machines")
        return
      }
      else if (machines.length === 0 && counter === 0 && value !== "") {
        res.status(404).send("No machines with that name")
        return
      }
      res.send(machines)
    } catch (err) {
      console.log(err);
      res.status(500).send("Error while fetching machines from DB on server")
    }
  }
  else {
    let query = "SELECT M.* FROM Machines M WHERE"
    let inserts = [] // using placeholder to prevent SQL Injection attack
    if (value !== "") {
      query += (" M.Name LIKE ? AND")
      inserts.push(value+"%")
    }
    query += (" M.ID IN (" +
      "SELECT JM.machine_ID from MachineUserGroups JM WHERE JM.group_ID IN (" +
      "SELECT JU.group_ID FROM UserUserGroups JU WHERE JU.user_ID=?)) ORDER BY M.Name LIMIT 50 OFFSET ?;")
    inserts.push(req.auth.sub, counter)

    try {
      const [machines] = await connection.query(query, inserts);
      if (machines.length === 0 && counter === 0 && value === "") {
        res.status(403).send("You don't have access to any machine")
      }
      else if (machines.length === 0 && counter !== 0) {
        res.status(404).send("No more machines")
      }
      else if (machines.length === 0 && counter === 0 && value !== "") {
        res.status(404).send("No machines with that name")
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
app.post('/server/machinesAdmin', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received machines admin request")
  const groupId = req.body.role
  const counter = req.body.counter
  const value = req.body.value
  let query1 = "SELECT * FROM Machines"
  let inserts = [] // using placeholder to prevent SQL Injection attack

  if (value !== "") {
    query1 += (" WHERE Name LIKE ?")
    inserts.push(value+"%")
  }
  query1 += (" ORDER BY Name LIMIT 50 OFFSET ?;")
  inserts.push(counter)

  try {
    const [machines] = await connection.query(query1, inserts);
    if (machines.length === 0 && counter !== 0) {
      res.status(404).send("No more machines")
      return
    }
    else if (machines.length === 0 && counter === 0 && value !== "") {
      res.status(404).send("No machines with that name")
      return
    }
    for (let i = 0; i < machines.length; i++) {
      const query2 = "SELECT * FROM MachineUserGroups WHERE machine_ID=? AND group_ID=?;"
      let inserts = [machines[i].ID, groupId] // using placeholder to prevent SQL Injection attack

      const [results] = await connection.query(query2, inserts);
      machines[i].isAvailable = results.length !== 0;
    }
    res.send(machines)
  } catch (err) {
    console.log(err);
    res.status(500).send("Error while fetching machines from DB on server")
  }
});

// generate certificate for a given machine
app.post('/server/generateCertificate', checkJwt, async (req, res) => {
  console.log("Received certificate generation request")
  const key = req.body.key
  const id = req.body.id
  const name = req.body.name
  const ip_address = req.body.ip_address
  const groups = req.body.groups

  // if the user is not an admin, check if he can access the machine
  if (!req.auth.permissions.includes('manage:users')) {
    const query = "SELECT MA.* FROM Machines MA WHERE MA.ID=? AND MA.Name=? AND MA.ID IN (" +
      "SELECT M.machine_ID FROM MachineUserGroups M WHERE M.machine_ID=? AND M.group_ID IN (" +
      "SELECT U.group_ID FROM UserUserGroups U WHERE U.user_ID=?));"
    let inserts = [id, name, id, req.auth.sub] // using placeholder to prevent SQL Injection attack

    try {
      const [results] = await connection.query(query, inserts);
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
    httpsAgent: httpsAgent,
  };

  const { data, error } = await callExternalApi({ config });

  if (data) {
    res.send(data)
    return
  }
  if (error) {
    console.log(error)
    res.status(500).send("Error while generating certificate")
  }
})

app.get('/server/', (req, res) => {
  console.log("Received hello request")
  // determine the number of proxies between client and server
  //const xForwardedFor = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  //res.send('X-Forwarded-For header:' + xForwardedFor)
  res.send(`Server listening on port ${port}`)
});

startServer();
