const Twit = require('twit');
const superagent = require('superagent');

const twitter = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

module.exports = async (potd) => {
  let base64EncodedImage;
  let mediaUploadResponse;
  let mediaId;

  try {
    // Fetches the image from the given url and converts it to a base 64 string
    base64EncodedImage = (await superagent.get(potd.url)).body.toString('base64');
  } catch (error) {
    throw new Error(`Failed to fetch image from ${potd.url} because of this error ${error}`);
  }

  try {
    if (!base64EncodedImage) {
      throw new Error('Variable base64EncodedImage cannot be undefined!');
    }

    // Post image encoded image to Twitter
    mediaUploadResponse = await twitter.post('media/upload', { media_data: base64EncodedImage });
  } catch (error) {
    throw new Error(`Failed to upload image because of this error: ${error}`);
  }

  try {
    if (!mediaUploadResponse) {
      throw new Error('Variable mediaUploadResponse cannot be undefined!');
    }

    mediaId = mediaUploadResponse.data.media_id_string;

    await twitter.post('media/metadata/create', {
      media_id: mediaId,
      alt_text: { text: potd.title },
    });
  } catch (error) {
    throw new Error(`Failed to upload metadata because of this error: ${error}`);
  }

  try {
    if (!mediaId) {
      throw new Error('Variable mediaId cannot be undefined!');
    }

    // now we can reference the media and post a tweet (media will attach to the tweet)
    await twitter.post('statuses/update', {
      status: `${potd.title}\n${potd.description}\n${potd.copyright}`,
      media_ids: [mediaId],
    });
  } catch (error) {
    throw new Error(`Failed to post Tweet because of this error: ${error}`);
  }
};
