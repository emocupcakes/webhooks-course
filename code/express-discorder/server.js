require("dotenv").config();
const express = require("express");
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


app.use(express.json());
app.use(bodyParser.json()); // To parse application/json bodies

app.get("/", (req, res) => res.send(`
  <html>
    <head><title>Success!</title></head>
    <body>
      <h1>You did it!</h1>
      <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Cool kid doing thumbs up" />
    </body>
  </html>
`));

app.post('/sms/8LvraOfRY5cbM3S8EDjhQu4KBeO1JkCv', (req, res) => {
  const data = req.body.data;
  
  if (!data) {
    return res.status(400).send('Missing data');
  }

  const from = data.payload.from.phone_number;
  const to = data.payload.to[0].phone_number;
  const message = data.payload.text;

  const myMessage = `📩 Received SMS from ${from} to ${to}: ${message}`;

  console.log(myMessage);
  const logFilePath = path.join(__dirname, 'moof.log');

  logToFile(myMessage, logFilePath);

  res.sendStatus(200); // Acknowledge receipt to Telnyx
});

app.post('/sms/L7FwMP0QnRZ2J3d7MpP11hpA3IKeHq1H', (req, res) => {
  const data = req.body.data;

  if (!data) {
    return res.status(400).send('Missing data');
  }

  const from = data.payload.from.phone_number;
  const to = data.payload.to[0].phone_number;
  const message = data.payload.text;

  const myMessage = `📩 Received SMS from ${from} to ${to}: ${message}`;

  console.log(myMessage);
  const logFilePath = path.join(__dirname, 'toof.log');

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
