const mongoose = require('mongoose');
const db = require('../index');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  video_file: {
    name: {
      type: String,
      required: false,
    },
    ETag: {
      type: String,
      required: false,
    },
    File: {
      type: String,
      required: false,
    },
    extension: {
      type: String,
      required: false,
    },
  },
  video_screenshot: {
    name: {
      type: String,
      required: false,

    },
    ETag: {
      type: String,
      required: false,
    },
    File: {
      type: String,
      required: false,
    },
    extension: {
      type: String,
      required: false,
    },
  },
}, {
  timestamps: true,
  collection: 'users',
});

const User = db.model('User', userSchema);

module.exports = User;
