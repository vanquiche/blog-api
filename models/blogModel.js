const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blog = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  comments: { type: Array },
  snippet: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
});

blog.virtual('url').get(function () {
  return '/blog/' + this._id;
});

module.exports = mongoose.model('Blog', blog);
