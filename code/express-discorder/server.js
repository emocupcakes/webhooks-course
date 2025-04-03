require("dotenv").config();
const express = require("express");
const basicAuth = require('express-basic-auth');

const axios = require("axios").default;
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');


// Function to write to the log file
function logToFile(message, logFilePath) {

  const pstDate = DateTime.now().setZone('America/Los_Angeles').toISO();
  const logMessage = `${pstDate} - ${message}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

function showLog(res, filename) {
  try {
    const logContent = fs.readFileSync(filename, 'utf-8');
    res.send(`<pre>${logContent}</pre>`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('File not found');
    } else {
      console.error(error);
      res.status(500).send('Server error');
    }
  }
}

const users = { [process.env.USERAUTH]: process.env.USERPASS };

const auth = basicAuth({
  users: users,
  challenge: true, // This will cause the browser to show a login prompt
});

app.use(express.json());
app.use(bodyParser.json()); // To parse application/json bodies

app.get("/", (req, res) => res.send(`
  <html>
    <head><title>Hooks!</title></head>
    <body>
      <h1>Hooks!</h1>
      <img src="https://i.pinimg.com/736x/60/2d/0f/602d0f4ed18cd92e08bb45307dbdf15d.jpg" alt="Doraemon" />
    </body>
  </html>
`));


app.get(process.env.USER_A_ENDPOINT, auth, (req, res) => {
  showLog(res, process.env.USER_A_FILE);
});

app.get(process.env.USER_B_ENDPOINT, auth, (req, res) => {
  showLog(res, process.env.USER_B_FILE);
});

app.post(process.env.WEBHOOK_URL_A, (req, res) => {
  const data = req.body.data;
  
  if (!data) {
    return res.status(400).send('Missing data');
  }

  const from = data.payload.from.phone_number;
  const to = data.payload.to[0].phone_number;
  const message = data.payload.text;

  const myMessage = `📩 Received SMS from ${from} to ${to}: ${message}`;

  console.log(myMessage);
  const logFilePath = path.join(__dirname, process.env.USER_A_FILE);

  logToFile(myMessage, logFilePath);

  res.sendStatus(200); // Acknowledge receipt to Telnyx
});

app.post(process.env.WEBHOOK_URL_B, (req, res) => {
  const data = req.body.data;

  if (!data) {
    return res.status(400).send('Missing data');
  }

  const from = data.payload.from.phone_number;
  const to = data.payload.to[0].phone_number;
  const message = data.payload.text;

  const myMessage = `📩 Received SMS from ${from} to ${to}: ${message}`;

  console.log(myMessage);
  const logFilePath = path.join(__dirname, process.env.USER_B_FILE);

  logToFile(myMessage, logFilePath);

  res.sendStatus(200); // Acknowledge receipt to Telnyx
});


app.use((error, req, res, next) => {
  res.status(500)
  res.send({error: error})
  console.error(error.stack)
  next(error)
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
