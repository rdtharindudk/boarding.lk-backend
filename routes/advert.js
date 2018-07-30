const { Advert, validate } = require("../models/advert");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const _ = require("lodash");
const bcrypt = require("bcrypt");
var upload = multer({ dest: 'uploads/' });

router.post('/new', upload.array('photos', 5),async function (req, res, next) {

    const {error} = validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let photos = [];

    for (let i = 0; i < req.files.length; i++){
        photos.push(req.files[i].filename);
    } 

    advert = new Advert({
        title : req.body.title,
        city : req.body.city,
        institute : req.body.institute,
        description : req.body.description,
        photos : photos,
        tags : req.body.tags,
        username : req.body.username,
        userphonenumber : req.body.userphonenumber,
        useremail : req.body.useremail
    });


    await advert.save();

    res.status(200).send(_.pick(advert, ["username", "useremail","city","userphonenumber","_id","photos"]));
    
});

module.exports = router;