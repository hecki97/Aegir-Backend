const routes = require('express').Router();
const feed = require('./rss-feed');

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Service is up and running!' });
});

// Simple logger that is invoked for every request.
routes.use((req, res, next) => {
  // log each request to the console
  console.log(req.method, req.url);
  console.log(req.body);

  // continue with the request
  next();
});

routes.use('/feed', feed);

module.exports = routes;
