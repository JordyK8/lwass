const bcrypt = require('bcrypt');
const saltRounds = 10;

const encrypt = (data) => bcrypt.hash(data, saltRounds);

const match = (password, passwordHash) => bcrypt.compare(password, passwordHash);

module.exports = {
    encrypt,
    match
};