require('dotenv').config();

const FileSystem = require("fs");
const exec = require('child_process').exec;
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');
const { expressjwt: jwt } = require("express-jwt");
const ManagementClient = require('auth0').ManagementClient;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 8000;

const nebula_pub_key_format_checks_enabled = true
// To improve security avoid giving too much info back to the user, keep False. To debug set to True.
const detailed_error_response = true

const CERTIFICATE_DIRECTORY = ''  // No need to specify a directory if the certificates are already in the current directory

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

// public key for certificate generation validation
// TODO: PRIMA ESEGUIRE SCRIPT PYTHON E VEDERE SE FUNZIONA, POI FARE CHIAMATA AL SERVER SENZA PASSARE DA CLIENT E VEDERE SE FUNZIONZ, INFINE FARE CHIAMATA DA CLIENT
async function validate_pub_key_format(pubKey) {
  // Define the expected patterns
  const begin_pattern = "-----BEGIN NEBULA X25519 PUBLIC KEY-----"
  const end_pattern = "-----END NEBULA X25519 PUBLIC KEY-----"

  // Check if the key starts and ends with the correct patterns
  if (pubKey.startsWith(begin_pattern) && pubKey.endsWith(end_pattern)) {
    // Extract the middle pattern from the key
    let middle_pattern = pubKey.split(begin_pattern)[-1].split(end_pattern)[0].strip()
    // Check if the middle pattern ends with "=" and has length 44 and doesn't contain whitespace
    if (middle_pattern.length === 44 && middle_pattern.endsWith('=') && !(/\s/.test(middle_pattern))) {
      return {'success': true, 'message': "The key is correctly formatted."}
    }
    else {
      return { 'success': false, 'message': "Error: Middle pattern is not correctly formatted." }
    }
  }
  else {
    return {'success': false, 'message': "Error: Key is not correctly formatted."}
  }
}

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

// generate certificate for a given machine
app.post('/generateCertificate', checkJwt, async (req, res) => {
  console.log("Received certificate generation request")
  const pubKey = req.body.pubKey;
  const pub_key_path = CERTIFICATE_DIRECTORY + "pubKey.pub"

  await FileSystem.writeFile(pub_key_path, pubKey, (error) => {
    if (error) {
      res.status(500).send("Error while writing pubKey to server: " + error.message)
    }
  });

  if (nebula_pub_key_format_checks_enabled) {
    // Validate the format of the .pub key
    let validation_result = await validate_pub_key_format(pubKey)
    if (!validation_result.success) {
      await FileSystem.rm(pub_key_path, (error) => {
        if (error) {
          res.status(500).send("Error while removing pubKey from server: " + error.message)
        }
      })

      if (detailed_error_response) {
        res.status(400).send("Error while validating pubKey: " + validation_result.message);
      }
      else {
        res.status(400).send("Error generating certificate");
      }
    }
  }

  //Get parameters from request
  const name = req.body.name
  const ip_address = req.body.ip_address
  const groups = req.body.nebula_groups

  exec('nebula-cert sign -in-pub ' + pub_key_path + ' -name "' + name +'" -ip "' + ip_address + '" --groups "' + groups + '" -ca-key /etc/nebula/ca.key -ca-crt /etc/nebula/ca.crt', async function(error, stdout, stderr) {
    if (error === null) {
      let certificate_path = name + '.crt'
      await FileSystem.readFile(certificate_path, async (error, data) => {
        if (error) {
          res.status(500).send("Error while reading certificate from server: " + error.message)
        }
        else {
          await FileSystem.rm(pub_key_path, (error) => {
            if (error) {
              res.status(500).send("Error while removing pubKey from server: " + error.message)
            }
          })
          await FileSystem.rm(certificate_path, (error) => {
            if (error) {
              res.status(500).send("Error while removing certificate from server: " + error.message)
            }
          })

          res.send(data.toString())
        }
      })
    }
    else {
      await FileSystem.rm(pub_key_path, (error) => {
        if (error) {
          res.status(500).send("Error while removing pubKey from server: " + error.message)
        }
      })
      res.status(500).send("Error while generating certificate: " + stderr)
    }
  });
})

app.get('/', (req, res) => {
  console.log("Received hello request")
  res.send(`Server listening on port ${port}`)
});

app.listen(port);