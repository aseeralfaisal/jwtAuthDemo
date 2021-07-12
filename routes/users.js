const { User, validate } = require('../UserSchema');
const auth = require('../authMiddleware');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = new User(req.body);

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    user.pass = await bcrypt.hash(user.pass, salt);
    await user.save();

    res.send(user);
  } catch (error) {
    console.log(error);
    res.send('An error occured');
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v');
    res.send(user);
  } catch (error) {
    console.log(error);
    res.send('An error occured');
  }
});

module.exports = router;
