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

// app.options('*', cors());

// app.use(cors({ origin: "https://titaja.com", credentials: true }))

const customers = require("./routes/customers");
const companies = require("./routes/companies");
const invoices = require("./routes/invoices");
const users = require("./routes/users");
const products = require("./routes/products");
const categories = require("./routes/categories");
const auth = require("./routes/auth");
const index = require("./routes/index");


app.use(cors());
app.options('*', cors())
app.use(express.json());
app.use("/api/customers", customers);
app.use("/api/companies", companies);
app.use("/api/invoices", invoices);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/products", products);
app.use("/api/categories", categories);
app.use("/", index);


mongoose.connect(config.get("db"))
.then(() => {
    console.log("Titaja - Server is running");
})
.catch((err)=> {
    console.log("An error occured: ", err);
});


const port = process.env.PORT || 6060;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})