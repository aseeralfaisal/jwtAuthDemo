const { User } = require("../UserSchema");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ name: req.body.name });
        if (!user) return res.status(400).send("Invalid name");

        const validPassword = await bcrypt.compare(
            req.body.pass,
            user.pass
        );
        if (!validPassword)
            return res.status(400).send("Invalid password");

        const token = user.generateAuthToken();
        res.send(token);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }
});

const validate = (user) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        pass: Joi.string().required(),
    });
    return schema.validate(user);
};

module.exports = router;