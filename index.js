const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  // Allows the resource to be accessed by any domain in a cross-site manner.
  origin: '*',
  // Only allow GET and POST requests
  methods: ['GET', 'POST'],
}));

app.get('/api/bing', async (req, res) => {
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
  console.log(`Runnning on ${port}`);
});
