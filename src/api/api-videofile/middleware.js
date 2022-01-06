const constants = require('../../lib/constants/glob');
const middleware = {
  /**
   * Validates fromdata
   * @param {string} data.name Username
   * @param {string} data.email user email
   * @param {number} data.age user age
   * @param {File} file file containing buffer
   * @return {Object<*>} { valid: bool, msg: string }
   */
  validateFromData: (req, res, next) => {
    const data = {
      ...req.body,
      ...req.files
    };
    let msg;
    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };
    if (!data.age) msg = 'Missing age from submition form.'
    if (!data.name || data.name.length < 2) msg = "Name invalid, note that given name must be at least two characters long.";
    if (!data.email || !validateEmail(data.email)) msg = "Given emailaddress seems to be invalid.";
    if (!data.file) msg = 'Missing videofile from submition form.';
    if (data.file && data.file.length > constants.MAX_VIDEO_SIZE) msg = 'File exceeds filesize limit of 1 Gb.';
    if (msg) res.status(400).json({
      error: msg
    });
    next();
  },
};

module.exports = middleware;