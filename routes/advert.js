const { Advert, validate } = require("../models/advert");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const _ = require("lodash");
const bcrypt = require("bcrypt");
var upload = multer({ dest: 'uploads/' });
const nodemailer = require('nodemailer');

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

    var tags = "" + req.body.title
    var tags = tags.toLowerCase().split(" ");
    advert = new Advert({
        title: req.body.title,
        city: req.body.city,
        institute: req.body.institute,
        description: req.body.description,
        photos: photos,
        publishedAt: Date.now(),
        tags: tags,
        username: req.body.username,
        userphonenumber: req.body.userphonenumber,
        useremail: req.body.useremail
    });



    await advert.save();
    console.log("tttt");
    sendEmail(advert);
    res.status(200).send(_.pick(advert, ["username", "useremail", "city", "userphonenumber", "_id", "photos", "publishedAt"]));

});

router.get("/length", async (req, res) => {

    let length = 0;

    Advert.collection.countDocuments({ approved: true }, (err, count) => {
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
        Advert.collection.countDocuments({ approved: true }, (err, count) => {
            if (err) {
                console.log(err);
            }
            length = count;
            res.status(200).send({ value: length });
        });
    }
    else {
        Advert.collection.countDocuments({ city: city, approved: true }, (err, count) => {
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
        .find({ approved: true })
        .sort({ publishedAt: -1 })
        .skip((pagenumber - 1) * pageSize)
        .limit(parseInt(pageSize));
    console.log(results.length);
    res.status(200).send(results);

});

router.get("/getAdvertById", async (req, res) => {
    let _id = req.query._id;
    const result = await Advert.findOne({ _id: _id });
    console.log(result);
    res.status(200).send(result);

});

router.get("/getNotApproved", async (req, res) => {
    const result = await Advert.findOne({ approved: false });
    console.log(result);
    res.status(200).send(result);

});

router.get("/lengthNotApproved", async (req, res) => {

    let length = 0;

    Advert.collection.countDocuments({ approved: false }, (err, count) => {
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
        .find({ approved: false })
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
            .find({ approved: true })
            .sort({ publishedAt: -1 })
            .skip((pagenumber - 1) * pageSize)
            .limit(parseInt(pageSize));
        console.log(results.length);
        res.status(200).send(results);
    }
    else {
        const results = await Advert
            .find({ city: city, approved: true })
            .skip((pagenumber - 1) * pageSize)
            .limit(parseInt(pageSize));
        console.log(results.length);
        res.status(200).send(results);
    }
});

router.get("/approve", async (req, res) => {
    let _id = req.query._id;

    const advert = await Advert.findById(_id);

    if (!advert) {
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
        .find({ 'tags': { $in: query }, 'approved': true })
        .sort({ publishedAt: -1 })
        .skip((pagenumber - 1) * pageSize)
        .limit(parseInt(pageSize));
    console.log(results.length);
    res.status(200).send(results);

});

router.get("/searchlength", async (req, res) => {

    let length = 0;
    let query = JSON.parse(req.query.query);
    Advert.collection.countDocuments({ 'tags': { $in: query }, 'approved': true }, (err, count) => {
        if (err) {
            console.log(err);
        }
        length = count;
        res.status(200).send({ value: length });
    });


});

function sendEmail(details) {
    let today = Date();
    let duedate = new Date(new Date().getTime()+(7*24*60*60*1000));
    let message = `
    <!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <style>
    .invoice-box {
        max-width: 800px;
        margin: auto;
        padding: 30px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px rgba(0, 0, 0, .15);
        font-size: 16px;
        line-height: 24px;
        font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        color: #555;
    }
    
    .invoice-box table {
        width: 100%;
        line-height: inherit;
        text-align: left;
    }
    
    .invoice-box table td {
        padding: 5px;
        vertical-align: top;
    }
    
    .invoice-box table tr td:nth-child(2) {
        text-align: right;
    }
    
    .invoice-box table tr.top table td {
        padding-bottom: 20px;
    }
    
    .invoice-box table tr.top table td.title {
        font-size: 45px;
        line-height: 45px;
        color: #333;
    }
    
    .invoice-box table tr.information table td {
        padding-bottom: 40px;
    }
    
    .invoice-box table tr.heading td {
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
    }
    
    .invoice-box table tr.details td {
        padding-bottom: 20px;
    }
    
    .invoice-box table tr.item td{
        border-bottom: 1px solid #eee;
    }
    
    .invoice-box table tr.item.last td {
        border-bottom: none;
    }
    
    .invoice-box table tr.total td:nth-child(2) {
        border-top: 2px solid #eee;
        font-weight: bold;
    }
    
    @media only screen and (max-width: 600px) {
        .invoice-box table tr.top table td {
            width: 100%;
            display: block;
            text-align: center;
        }
        
        .invoice-box table tr.information table td {
            width: 100%;
            display: block;
            text-align: center;
        }
    }
    
    /** RTL **/
    .rtl {
        direction: rtl;
        font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
    }
    
    .rtl table {
        text-align: right;
    }
    
    .rtl table tr td:nth-child(2) {
        text-align: left;
    }
    </style>
</head>

<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                <img src="http://35.200.198.244:3500/599435.png" style="width:100%; max-width:300px;">
                            </td>
                            
                            <td>
                                Invoice #: ${details.publishedAt}<br>
                                Created: ${today}<br>
                                Due: ${duedate}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                Symantex technologies<br>
                                katubedda<br>
                                Moratuwa
                            </td>
                            
                            <td>
                                ${details.username}<br>
                                ${details.useremail}<br>
                                ${details.userphonenumber}com
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <tr class="heading">
                <td>
                    Payment Method
                </td>
                
                <td>
                    Bank
                </td>
            </tr>
            
            <tr class="details">
                <td>
                    ACC NUM - XXXXXXXXXXXXXXX <BR>
                    Symantex technologies
                    Commercial Bank
                    Ratnapura
                </td>
                
                <td>
                    
                </td>
            </tr>
            
            <tr class="heading">
                <td>
                    Item
                </td>
                
                <td>
                    Price
                </td>
            </tr>
            
            <tr class="item">
                <td>
                    Advertisement
                </td>
                
                <td>
                    Rs 1000.00
                </td>
            </tr>            
        </table>
    </div>
</body>
</html>`;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tophomelk@gmail.com',
            pass: 'ln-vd789'
        }
    });

    var mailOptions = {
        from: 'tophomelk@gmail.com',
        to: `${details.useremail}`,
        subject: `Invoice ${details.publishedAt}`,
        html: message
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

};

router.get('/remove',async (req,res) => {
    let _id = req.query.id;
    const result = await Advert.findByIdAndRemove(_id);
    console.log(result);
    res.status(200).send(JSON.stringify(result));
});


module.exports = router;