require('dotenv').config();
const app = require('../../lib/server.js');

const bootstrap = require('./bootstrap');

bootstrap(app);

app.listen(process.env.PORT, () => {
  console.log('Server running on port:' + process.env.PORT);
})