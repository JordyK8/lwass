const router = require('express').Router();
const UserService = require('../../svc/user-svc');
router.get('/', ( req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
})

router.post('/formSubmit', async (req, res) => {
    const data = {...req.body, ...req.files};
    const validate = UserService.validateFromData(data);

    if (!validate.valid) {
        return res.status(400).send(validate.msg);
      }
    const userService = new UserService();
    try {
        const user = await userService.create(data);
        res.status(200).send(JSON.stringify(user))
    } catch(e) {
        res.status(500).send({"err": e.message});
    }
})

module.exports = router;