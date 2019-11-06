const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const mongoose = require('mongoose');

/* Base Setup */

const app = express();
const port = process.env.PORT || 3000;
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://<user>:<pass>@<conn>/<db>';
const routes = require('./routes');

// Establish database connection

mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', () => console.error(console, 'connection error:'));
db.once('open', () => console.log('Successfully connected to MongoDB!'));

/* Middlewares */

app.use(cors({
  // Allows the resource to be accessed by any domain in a cross-site manner.
  origin: '*',
  // Only allow GET and POST requests
  methods: ['GET', 'POST'],
}));

app.use(express.json()); // to support JSON-encoded bodies

app.set('view engine', 'pug');

/* Routes */

app.use('/', routes);

/* Start the server */

app.listen(port, () => console.log(`Backend running on ${port}`));
