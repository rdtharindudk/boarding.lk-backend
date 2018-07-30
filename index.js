const express =  require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const users = require("./routes/users");
const auth = require("./routes/auth");
const advert = require("./routes/advert")
const multer = require("multer");
const mongoose = require("mongoose");
const port = process.env.port || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/users",users);
app.use("/api/auth",auth);
app.use("/api/advert",advert);

mongoose.connect("mongodb://localhost:27017/boarding", {useNewUrlParser : true});

app.listen(port , ()=>{
    console.log(`Server is listening on port ${port}. . . ` );
    
});



