const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const mongoose = require('mongoose');

const BingPotD = require('./models/bing-potd.model');

const app = express();
const port = process.env.PORT || 3000;
const mongoDBUrl = process.env.MONGODB_URL || 'mongodb://<user>:<pass>@<conn>/<db>';

mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Successfully connected to MongoDB!'));

app.use(cors({
  // Allows the resource to be accessed by any domain in a cross-site manner.
  origin: '*',
  // Only allow GET and POST requests
  methods: ['GET', 'POST'],
}));

app.use(express.json()); // to support JSON-encoded bodies

app.set('view engine', 'pug');

app.post('/bing-potd/feed', async (req, res) => {
  const picOfTheDay = new BingPotD({
    title: req.body.title,
    description: req.body.copyright,
    url: `https://www.bing.com${req.body.url}`,
    copyright: req.body.copyrightlink,
    hash: req.body.hsh,
  });

  await picOfTheDay.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).end();
    }
  });
  res.status(200);
});

app.get('/bing-potd/feed', cors({ methods: 'GET', origin: '*' }), (req, res) => {
  BingPotD.find({})
    .sort({ date: 'desc' })
    .limit(20)
    .exec((err, posts) => {
      if (err) {
        console.error(err);
        res.status(500).end();
      }
      return res.render('rss', { items: posts });
    });
});

app.get('/bing-potd/feed', async (req, res) => {
  const response = await superagent.get('https://www.bing.com/HPImageArchive.aspx').query({
    format: 'js', idx: 0, n: 8, mkt: 'en-US',
  });

  if (response.error) {
    console.error(response.error);
    res.status(500).end();
  }

  res.send(response.body.images);
});

app.listen(port, () => {
  console.log(`Backend running on ${port}`);
});
