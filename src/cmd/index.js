const router = require('../api/routes.js');
const express = require('express');
const app = require('../lib/server.js');
const upload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.json());

app.use(express.static('public'));

app.use(express.urlencoded({
    extended: true
}))

app.use(upload());

app.use('/api', router);

app.listen(process.env.PORT, () => {
    console.log(process.env);
    console.log('server running on port:' + process.env.PORT);
})


