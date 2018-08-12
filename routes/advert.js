const { Advert, validate } = require("../models/advert");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const _ = require("lodash");
const bcrypt = require("bcrypt");
var upload = multer({ dest: 'uploads/' });

router.post('/new', upload.array('photos', 5), async function (req, res, next) {

    const { error } = validate(req.body);

    if (error) {
        console.log(error);
        return res.status(400).send(error.details[0].message);
    }

    let photos = [];

    for (let i = 0; i < req.files.length; i++) {
        photos.push(req.files[i].filename);
    }

    advert = new Advert({
        title: req.body.title,
        city: req.body.city,
        institute: req.body.institute,
        description: req.body.description,
        photos: photos,
        tags: req.body.tags,
        username: req.body.username,
        userphonenumber: req.body.userphonenumber,
        useremail: req.body.useremail
    });


    await advert.save();
    console.log("tttt");
    res.status(200).send(_.pick(advert, ["username", "useremail", "city", "userphonenumber", "_id", "photos"]));

});

router.get("/length", async (req, res) => {

    let length = 0;

    Advert.collection.countDocuments({approved : true}, (err, count) => {
        if (err) {
            console.log(err);
        }
        length = count;
        res.status(200).send({ value: length });
    });


});

router.get("/lengthByCity", async (req, res) => {

    let length = 0;
    let city = req.query.city;
    console.log(city);
    if (city == 'All') {
        Advert.collection.countDocuments({approved : true}, (err, count) => {
            if (err) {
                console.log(err);
            }
            length = count;
            res.status(200).send({ value: length });
        });
    }
    else {
        Advert.collection.countDocuments({ city: city, approved : true }, (err, count) => {
            if (err) {
                console.log(err);
            }
            length = count;
            res.status(200).send({ value: length });
        });
    }
});



router.get("/getAll", async (req, res) => {
    let pagenumber = req.query.pagenumber;
    let pageSize = req.query.pagesize;
    console.log(pagenumber + " " + pageSize);
    const results = await Advert
        .find({approved : true})
        .skip((pagenumber - 1) * pageSize)
        .limit(parseInt(pageSize));
    console.log(results.length);
    res.status(200).send(results);

});

router.get("/getAdvertById", async (req, res) => {
    let _id = req.query._id;
    const result = await Advert.findOne({_id : _id});
    console.log(result);
    res.status(200).send(result);

});

router.get("/getNotApproved", async (req, res) => {
    const result = await Advert.findOne({approved : false});
    console.log(result);
    res.status(200).send(result);

});

router.get("/lengthNotApproved", async (req, res) => {

    let length = 0;

    Advert.collection.countDocuments({approved : false}, (err, count) => {
        if (err) {
            console.log(err);
        }
        length = count;
        res.status(200).send({ value: length });
    });


});

router.get("/getAllNotApproved", async (req, res) => {
    let pagenumber = req.query.pagenumber;
    let pageSize = req.query.pagesize;
    console.log(pagenumber + " " + pageSize);
    const results = await Advert
        .find({approved : false})
        .skip((pagenumber - 1) * pageSize)
        .limit(parseInt(pageSize));
    console.log(results.length);
    res.status(200).send(results);

});

router.get("/getAllByCity", async (req, res) => {

    let pagenumber = req.query.pagenumber;
    let pageSize = req.query.pagesize;
    let city = req.query.city;
    console.log(city);
    console.log(pagenumber + " " + pageSize);
    if (city == "All") {
        const results = await Advert
            .find({approved : true})
            .skip((pagenumber - 1) * pageSize)
            .limit(parseInt(pageSize));
        console.log(results.length);
        res.status(200).send(results);
    }
    else {
        const results = await Advert
            .find({ city: city ,approved : true})
            .skip((pagenumber - 1) * pageSize)
            .limit(parseInt(pageSize));
        console.log(results.length);
        res.status(200).send(results);
    }
});

router.get("/approve", async (req, res) => {
    let _id = req.query._id;

    const advert = await Advert.findById(_id);
    
    if (!advert){
        return res.status(400).send();
    }
    advert.approved = true;

    const result = await advert.save();

    res.status(200).send(result);
});

router.get("/search", async (req, res) => {
    let pagenumber = req.query.pagenumber;
    let pageSize = req.query.pagesize;
    let query = JSON.parse(req.query.query);
    console.log(query[0]);
    console.log(pagenumber + " " + pageSize);
    const results = await Advert
        .find({'tags' : { $in : query }, 'approved' : true})
        .skip((pagenumber - 1) * pageSize)
        .limit(parseInt(pageSize));
    console.log(results.length);
    res.status(200).send(results);

});

router.get("/searchlength", async (req, res) => {

    let length = 0;
    let query = JSON.parse(req.query.query);
    Advert.collection.countDocuments({'tags' : { $in : query }, 'approved' : true}, (err, count) => {
        if (err) {
            console.log(err);
        }
        length = count;
        res.status(200).send({ value: length });
    });


});


module.exports = router;