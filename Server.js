const express = require('express');
const User = require('./UserSchema');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => console.log('connected to DB'))
  .catch((err) => console.log(err));

app.post('/api/signup', async (req, res) => {
  const userExists = await User.findOne({ name: req.body.name });
  if (!userExists) {
    const { name, pass } = req.body;
    const hashPass = await bcrypt.hash(pass, 10);
    const response = await User.create({
      name,
      pass: hashPass,
    });
    res.json({ response });
  } else res.send('User already exists'); //forbidden
});

app.post('/api/login', async (req, res) => {
  const { name, pass } = req.body;
  const user = await User.findOne({ name: name });

  if (!user) return res.status(403).json({ error: 'Invalid Username' });

  if (await bcrypt.compare(pass, user.pass)) {
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      process.env.PRIVATE_KEY
    );
    return res.status(200).json({ token });
  } else res.status(403).json({ error: 'Wrong Password' });
});

app.post('/api/changePassword', async (req, res) => {
  const { name, pass } = req.body;
  const hashPass = await bcrypt.hash(pass, 10);
  const userExists = await User.findOne({ name: name });
  if (userExists) {
    await User.updateOne({ name }, { pass: hashPass });
    res.send('success');
  } else res.send(403);
});

app.post('/api/verifyUser', async (req, res) => {
  const { token } = req.body;
  const user = jwt.verify(token, process.env.PRIVATE_KEY);
  res.json({ user });
});

app.listen(5001, () => console.log('The server is working'));
