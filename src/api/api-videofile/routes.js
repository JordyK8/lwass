const router = require('express').Router();
const { validateFromData } = require('./middleware');
const UserService = require('../../svc/user-svc');

router.get('/', ( req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

router.post('/formSubmit', validateFromData, async (req, res) => {
    const data = {...req.body, ...req.files};
    const userService = new UserService();
    try {
        const user = await userService.create(data);
        res.json(user);
    } catch(e) {
        res.json(e);
    };
});

module.exports = router;