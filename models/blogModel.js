const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blog = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  comments: { type: Array },
  createdAt: { type: Date, default: Date.now, required: true },
  publishedAt: { type: Date },
});

module.exports = mongoose.model('Blog', blog);
