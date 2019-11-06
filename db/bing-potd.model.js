const mongoose = require('mongoose');

const { Schema } = mongoose;

const BingPotD = new Schema({
  title: String,
  description: String,
  url: String,
  date: { type: Date, default: Date.now },
  copyright: String,
  hash: { type: String, min: 32, max: 32 },
});

// Export the model
module.exports = mongoose.model('BingPotD', BingPotD);
