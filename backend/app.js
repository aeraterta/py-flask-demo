const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = parseInt(process.env.PORT, 10) || 9000;
const host = process.env.HOST || 'localhost';
//const host = process.env.HOST || 'cbm_node';
const server = app.listen( port, host, () => {
  console.log(`The server is running at ${host}:${port}`);
});

/*
API Connection
*/
require('./src/routes')(app);
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to CBM API',
}));

/*
Socket IO Connection
*/
const io = require('./src/middlewares/socket-io')(server);

/*
MQTT Connection
*/
require('./src/middlewares/mqtt-connection')(io);
