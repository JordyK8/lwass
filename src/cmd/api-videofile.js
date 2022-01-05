const express = require('express');
const upload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = require('../lib/server.js');
const router = require('../api/api-videofile/routes');

app.use(bodyParser.json());

app.use(express.static('public'));

app.use(express.urlencoded({
  extended: true
}));

app.use(upload());

app.use('/api', router);

app.listen(process.env.PORT, () => {
  console.log('server running on port:' + process.env.PORT);
})