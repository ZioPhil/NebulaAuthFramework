require('dotenv').config();

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

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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

// TODO: temporary custom data, implement nebula network connection
let machines = require('./machines_db')

// get all users
app.get('/users', checkJwt, checkPermissions, (req, res) => {
  console.log("Received users request")
  const userId = req.auth.sub

  managementAPI.users.getAll()
    .then(function(users) {

      // remove current user from final result
      for(let i = 0; i < users.data.length; i++) {
        if(users.data[i].user_id === userId) {
          users.data.splice(i, 1);
        }
      }

      res.send(users.data);
    })
    .catch(function(err) {
      console.log(err);
    });
});

// get machines available to the user
app.get('/machinesNormal', checkJwt, (req, res) => {
  console.log("Received machines request")
  if(req.auth.permissions.includes('manage:users')) {
    res.send(machines);
  }
  else {
    const userId = req.auth.sub
    let customList = []
    for (let i = 0; i < machines.length; i++){
      if(machines[i].users.includes(userId)) {
        customList.push(machines[i])
      }
    }
    res.send(customList)
  }
});

// get all machines
app.get('/machinesAdmin', checkJwt, checkPermissions, (req, res) => {
  console.log("Received machines admin request")
  res.send(machines);
});

// update list of users that can access a machine
app.post('/updateMachine', checkJwt, checkPermissions, async (req, res) => {
  console.log("Received updateMachine request")
  const machine = req.body.machine;

  for (let i = 0; i < machines.length; i++) {
    if (machines[i].id === machine.id) {
      machines[i].users = machine.users;
      break;
    }
  }
  await FileSystem.writeFile('machines_db.json', JSON.stringify(machines), (error) => {
    if (error) throw error;
  });

  res.send(true)
});

app.get('/', (req, res) => {
  console.log("Received hello request")
  res.send(`Server listening on port ${port}`)
});

app.listen(port);