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

app.post('/bing/pic-of-the-day/update', async (req, res) => {
  // Only proceed if the body holds a secret AND the secret matches *exactly* the stored secret!
  if (!(req.body.secret && postSecret.localeCompare(req.body.secret) === 0)) {
    res.sendStatus(401);
  }

  try {
    // Request current version of the Bing RSS feed
    const response = await superagent.get('https://www.bing.com/HPImageArchive.aspx').query({
      format: 'js', idx: 0, n: 1, mkt: 'en-US',
    });

    // Extract image from response
    const image = response.body.images[0];

    // Create new instance of the Bing Picture of the Day schema
    const potd = new BingPotD({
      title: image.title,
      description: image.copyright,
      url: `https://www.bing.com${image.url}`,
      copyright: image.copyrightlink,
      hash: image.hsh,
    });

    // Insert into MongoDB
    await potd.save();
    // Close connection with status 200 (OK)
    res.sendStatus(200);
  } catch (err) {
    // Log error to console
    console.error(err);
    // Close connection with status 500 (Internal Server Error)
    res.sendStatus(500);
  }
});

app.post('/bing/pic-of-the-day/feed', async (req, res) => {
  // Only proceed if the body holds a secret AND the secret matches *exactly* the stored secret!
  if (!(app.body.secret && postSecret.localeCompare(app.body.secret) === 0)) {
    res.sendStatus(401);
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
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
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
        res.sendStatus(500);
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
