const express = require('express');
const upload = require('express-fileupload');
const bodyParser = require('body-parser');
const router = require('../../api/api-videofile/routes');

module.exports = (app) => {
  app.use(bodyParser.json());
  app.use(express.static('public'));
  app.use(express.urlencoded({
    extended: true
  }));
  app.use(upload());
  app.use('/api', router);
};