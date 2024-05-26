require('dotenv').config();

const fileupload = require("express-fileupload");
const callExternalApi = require("./external-api.service")
const FileSystem = require("fs");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
const { expressjwt: jwt } = require("express-jwt");
const ManagementClient = require('auth0').ManagementClient;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8000;

const nebulaApiServerUrl = process.env.VITE_NEBULA_API_ADDRESS;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());

// enviroment variables in .env file
const authConfig = {
  domain: process.env.VITE_AUTH0_DOMAIN,
  audience: process.env.VITE_AUTH0_AUDIENCE,
  clientId: process.env.VITE_CLIENT_ID,
  clientSecret: process.env.VITE_CLIENT_SECRET
};

const managementAPI = new ManagementClient({
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  clientSecret: authConfig.clientSecret
});

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

// TODO: add logs
// TODO: temporary custom data, implement nebula network connection
let machines = require('./machines_db')

// get all users
app.post('/server/users', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received users request")
  const roleId = req.body.role

  await managementAPI.users.getAll()
    .then(async function(users) {
      for (let i = 0; i < users.data.length; i++) {
        await managementAPI.users.getRoles({id: users.data[i].user_id})
          .then(function(roles) {
            let roleIdList = []
            for (let j = 0; j < roles.data.length; j++) {
              roleIdList.push(roles.data[j].id)
            }

            // remove admins from list
            if (roleIdList.includes(process.env.VITE_AUTH0_ADMIN_ROLE_ID)) {
              users.data.splice(i, 1);
              i--;
            }
            //check if user has role
            else users.data[i].hasRole = roleIdList.includes(roleId);
          })
      }
      res.send(users.data);
    }).catch(function(err) {
      console.log(err);
    });
});

//get all roles
app.get('/server/roles', checkJwt, checkPermissions, (req, res) => {
  console.log("Received roles request")

  managementAPI.roles.getAll()
    .then(function(roles) {
      // remove srs_admin role from final result
      for(let i = 0; i < roles.data.length; i++) {
        if(roles.data[i].id === process.env.VITE_AUTH0_ADMIN_ROLE_ID) {
          roles.data.splice(i, 1);
          break;
        }
      }

      res.send(roles.data);
    }).catch(function(err) {
      console.log(err);
    });
});

// update users for role
app.post('/server/updateRoleUsers', checkJwt, checkPermissions, (req, res) => {
  console.log("Received update role users request")
  const roleId = req.body.roleId
  const userId = req.body.userId
  const value = req.body.value

  if (value) {
    managementAPI.users.assignRoles({ id: userId }, { roles: [roleId] })
      .then(function(response) {
        if (response.status === 204) {
          res.send(true);
        }
        else {
          res.send(false);
        }
      }).catch(function(err) {
      console.log(err);
    });
  }
  else {
    managementAPI.users.deleteRoles({ id: userId }, { roles: [roleId] })
      .then(function(response) {
        if (response.status === 204) {
          res.send(true);
        }
        else {
          res.send(false);
        }
      }).catch(function(err) {
      console.log(err);
    });
  }
});

// update machines for role
app.post('/server/updateRoleMachines', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received update role machines request")
  const roleId = req.body.roleId
  const machineId = req.body.machineId
  const value = req.body.value
  let found = false

  try {
    if (value) {
      for (let i = 0; i < machines.length; i++) {
        if (machines[i].id === machineId) {
          found = true//check if user has role
          machines[i].roles.push(roleId)

          await FileSystem.writeFile('machines_db.json', JSON.stringify(machines), (error) => {
            if (error) {
              console.log(error)
              res.status(500).send("Error while saving machines configuration");
            }
          });

          res.send(true)
        }
      }
      if (!found) res.send(false)
    } else {
      for (let i = 0; i < machines.length; i++) {
        if (machines[i].id === machineId) {
          found = true
          machines[i].roles.splice(machines[i].roles.indexOf(roleId), 1);

          await FileSystem.writeFile('machines_db.json', JSON.stringify(machines), (error) => {
            if (error) {
              console.log(error)
              res.status(500).send("Error while saving machines configuration");
            }
          });

          res.send(true)
        }
      }
      if (!found) res.send(false)
    }
  } catch (err) {
    console.log(err)
    res.status(500).send("Error while saving machines configuration");
  }
});

// create new role
app.post('/server/createRole', checkJwt, checkPermissions, (req, res) => {
  console.log("Received create role request")
  const roleName = req.body.name

  managementAPI.roles.create({ name: roleName })
    .then(function(response) {
      if (response.status === 200){
        res.send(true)
      }
      else {
        res.send(false)
      }
    }).catch(function(err) {
    console.log(err);
  });
});

// delete role
app.post('/server/deleteRole', checkJwt, checkPermissions, (req, res) => {
  console.log("Received delete role request")

  if (req.body.roleId !== process.env.VITE_AUTH0_ADMIN_ROLE_ID) {
    managementAPI.roles.delete({ id: req.body.roleId })
      .then(function(response) {
        if (response.status === 200) {
          res.send(true);
        }
        else {
          res.send(false);
        }
      }).catch(function(err) {
      console.log(err);
    });
  }
  else res.status(403).send("Can't remove admin role")
});

// get machines available to the user
app.get('/server/machinesNormal', checkJwt, async (req, res) => {
  console.log("Received machines request")

  if (req.auth.permissions.includes('manage:users')) {
    res.send(machines);
  }
  else {
    let roleIdList = []
    let customList = []

    await managementAPI.users.getRoles({ id: req.auth.sub })
      .then(function(roles) {
        for (let i = 0; i < roles.data.length; i++) {
          roleIdList.push(roles.data[i].id)
        }
        for (let i = 0; i < machines.length; i++) {
          for (let j = 0; j < machines[i].roles.length; j++) {
            if (roleIdList.includes(machines[i].roles[j])) {
              customList.push(machines[i])
              break
            }
          }
        }
        res.send(customList)
      }).catch(function(err) {
        console.log(err);
        res.status(500).send(err)
      });
  }
});

// get all machines
app.post('/server/machinesAdmin', checkJwt, checkPermissions, (req, res) => {
  console.log("Received machines admin request")
  const roleId = req.body.role

  for (let i = 0; i < machines.length; i++) {
    machines[i].isAvailable = machines[i].roles.includes(roleId);
  }

  res.send(machines);
});

// generate certificate for a given machine
app.post('/server/generateCertificate', checkJwt, async (req, res) => {
  console.log("Received certificate generation request")
  const key = req.body.key
  const name = req.body.name
  const ip_address = req.body.ip_address
  const groups = req.body.groups
  let found = false

  console.log("check1")
  // check if the user can access the machine
  let roleIdList = []
  await managementAPI.users.getRoles({ id: req.auth.sub })
    .then(async function(roles) {
      console.log("check2")
      for (let i = 0; i < roles.data.length; i++) {
        roleIdList.push(roles.data[i].id)
      }
      
      console.log("check3")
      if (roleIdList.includes(process.env.VITE_AUTH0_ADMIN_ROLE_ID)) {
        found = true // the user is an admin
      }
      else {
        console.log("check4")
        for (let i = 0; i < machines.length; i++) {
          if (machines[i].name === name) {
            for (let j = 0; j < machines[i].roles.length; j++) {
              if (roleIdList.includes(machines[i].roles[j])) {
                found = true
                break
              }
            }
          }
          if (found) break
        }
      }
    }).catch(function(err) {
      console.log(err);
      res.status(500).send(err)
    });

  if (found) {
    console.log("check5")
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

    console.log("check6")
    const { data, error } = await callExternalApi({ config });

    if (data) {
      console.log("check7")
      res.send(data)
    }
    if (error) {
      console.log("check8")
      console.log(error)
      res.status(500).send(error)
    }
  }
  else {
    res.status(403).send("You can't access this machine")
  }
})

app.get('/server/', (req, res) => {
  console.log("Received hello request")
  res.send(`Server listening on port ${port}`)
});

app.listen(port);
