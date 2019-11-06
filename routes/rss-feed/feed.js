const BingPotD = require('../../db/bing-potd.model');

module.exports = async (req, res) => {
  try {
    // Select all items in collection, sort in descending order by date and limit to 20 entries
    const posts = await BingPotD.find({}).sort({ date: 'desc' }).limit(20);

    // Set appropriate conent type for rss.
    res.type('application/rss+xml');
    // Render RSS feed using the template in views/rss
    res.status(200).render('rss', { items: posts });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
