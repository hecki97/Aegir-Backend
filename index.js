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

app.post('/bing/pic-of-the-day/feed', async (req, res) => {
  // Only proceed if the body holds a secret AND the secret matches *exactly* the stored secret!
  if (!(app.body.secret && postSecret.localeCompare(app.body.secret) === 0)) {
    res.status(401).end();
  }

  const picOfTheDay = new BingPotD({
    title: req.body.title,
    description: req.body.copyright,
    url: `https://www.bing.com${req.body.url}`,
    copyright: req.body.copyrightlink,
    hash: req.body.hsh,
  });

  try {
    await picOfTheDay.save();
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

app.get('/bing/pic-of-the-day/feed', cors({ methods: 'GET', origin: '*' }), (req, res) => {
  // Select all items in collection, sort in descending order by date and limit to 20 entries
  BingPotD.find({})
    .sort({ date: 'desc' })
    .limit(20)
    .exec((err, posts) => {
      if (err) {
        console.error(err);
        res.status(500).end();
      }

      // Set appropriate conent type for rss.
      res.type('application/rss+xml');
      // Render RSS feed using the template in views/rss
      return res.render('rss', { items: posts });
    });
});

app.listen(port, () => {
  console.log(`Backend running on ${port}`);
});
