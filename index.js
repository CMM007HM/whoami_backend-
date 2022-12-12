const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const express = require("express");
var cors = require('cors');
const app = express();

const config = require("config");


if(!config.get("jwtPrivateKey")){
    console.error("FATAL ERROR: private key is not defined");
    process.exit(1);
}

const users = require("./routes/users");
const categories = require("./routes/categories");
const products = require("./routes/passwords");
const auth = require("./routes/auth");
const index = require("./routes/index");


app.use(cors());
app.options('*', cors())
app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/categories", categories);
app.use("/api/passwords", products);
app.use("/", index);


mongoose.connect(config.get("db"))
.then(() => {
    console.log("WhoAmI - Server is running");
})
.catch((err)=> {
    console.log("An error occured: ", err);
});


const port = process.env.PORT || 9090;

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
}).on('error', (e) => { 
    console.log(e.message);
})