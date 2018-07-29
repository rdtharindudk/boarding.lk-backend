const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

router.post("/register", async (req,res) => {

    const {error} = validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email : req.body.email});

    if (user) {
        return res.status(400).send("User already registered.");
    }

    user = new User({
        name : req.body.name,
        email : req.body.email,
        address : req.body.address,
        password : req.body.password,
        phonenumber : req.body.phonenumber,
        city : req.body.city
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);

    await user.save();

    res.status(200).send(_.pick(user, ["name", "email","city","phonenumber","_id","isAdmin"]));

});

module.exports = router;

