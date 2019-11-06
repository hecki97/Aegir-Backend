const routes = require('express').Router();
const feed = require('./feed');
const update = require('./update');

routes.get('/', feed);
routes.post('/update', update);

module.exports = routes;
