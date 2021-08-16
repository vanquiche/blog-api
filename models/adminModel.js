const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const admin = new Schema({
  name: {type: String, required: true},
  email: {type: String, required: true},
  lastname: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  role: {type: String, default: 'admin', required: true},
  createdAt: {type: Date, require: true}
})

module.exports = mongoose.model('Admin', admin)