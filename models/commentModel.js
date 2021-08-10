const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = new Schema({
  user: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('Comment', comment);
