const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const nodemailer = require('nodemailer');
const admin = require("../middleware/admin");
const config = require("config");
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require("lodash");
const router = express.Router();
const {User, validate} = require('../models/users');
const {Company} = require("../models/companies");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tflux2011@gmail.com',
      pass: '@rianna2016'
    }
  });
 
router.get("/me", auth, async(req, res)=>{
    const user = await User.findById(req.user._id).select("-password -__v");
    if(!user){
        let data = {
            message: "Empty data",
            status: false
        }
        return res.status(204).send(data);
    }
    res.send([{user}]);
})

router.get("/", [auth, admin], async(req, res)=>{
    const users = await User.find().select("-password");
    if(!users){
        let data = {
            message: "Empty data",
            status: false
        }
        return res.status(204).send(data);
    }
    let data = {
        items: users,
        status: true
    };
    res.send(data);
})

router.post("/", async(req, res) => {
    const {error} = validate(req.body);
    if(error){
        let data = {
            message:error.details[0].message,
            status: false,
        }
        return res.status(400).send(data);
    }

    let user = await User.findOne({email: req.body.email});
    if(user)return res.status(400).send({message: 'User already exists', status: false});

    user = new User(_.pick(req.body, ["firstName", "lastName", "email", "password", "company", "isAdmin"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = user.generateAuthToken();

    //Create company
    let company = new Company({companyName: req.body.company, userId: user._id});
    await company.save();

    let data = {
        items: _.pick(user, ["_id","firstName", "lastName", "email", "isAdmin"]),
        company: _.pick(company, ["_id", "companyName"]),
        status: true
    }

    var mailOptions = {
        from: 'tflux2011@gmail.com',
        to: req.body.email,
        subject: 'Your account was created successfully',
        text: 'Your account was created successfully.'
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.header("x-auth-token", token).send(data);
});


router.put("/", auth, async(req, res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send([{message: error.details[0].message}]);
    const { _id:loggedInUserId }  = req.user;
    let user = await User.findByIdAndUpdate(loggedInUserId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
        company: req.body.company,
        acceptTerms: req.body.acceptTerms,
    },{new:true} ).select("-__v");
    if(!user) return res.status(404).send("Could not find user with the given ID");
    res.send(user);
});

module.exports = router;