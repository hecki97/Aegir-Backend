const superagent = require('superagent');

const postSecret = process.env.UPDATE_RSS_SECRET || '<post-secret>';
const BingPotD = require('../../db/bing-potd.model');
const bingBot = require('../../bing-bot');

module.exports = async (req, res) => {
  // Only proceed if the body holds a secret AND the secret matches *exactly* the stored secret!
  if (!(req.body.secret && postSecret.localeCompare(req.body.secret) === 0)) {
    res.sendStatus(401);
    return;
  }

  try {
    // Request current version of the Bing RSS feed
    const response = await superagent.get('https://www.bing.com/HPImageArchive.aspx').query({
      format: 'js', idx: 0, n: 1, mkt: 'en-US',
    });

    // Extract first image from response
    const image = response.body.images[0];

    // Create new database entry
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
};
