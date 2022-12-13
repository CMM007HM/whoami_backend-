const express = require('express');
const router = express.Router();
const { Category } = require("../models/categories");
const { User } = require("../models/users");
const { Password, validate } = require('../models/passwords');
const auth  = require("../middleware/auth");
const ObjectId = require('mongoose').Types.ObjectId;



//Get all passwords
router.get("/", auth, async (req, res)=> {
    const { _id:loggedInUserId }  = req.user;
    const passwords =  await Password.find({userId: loggedInUserId}).select("-__v");
    if(passwords.length < 1)return res.send([{message:"Sorry, you don't have any passwords", status: true}])
    
    var allpasswords = [];
    await Promise.all(passwords.map(async(password) => {
        const category =  await Category.find({_id:password.category._id});
        if(category.length > 0){
            password.category.name = category[0].name;
            allpasswords.push(password);
        } 
            //return res.send([{message:"Sorry, you don't have any passwords matching the category", status: true}]);
        // console.log(category[0]);
    }));

    res.send(allpasswords);

});

// Get single password by ID
router.get("/:id", auth, async (req, res) =>{
        // if(typeof(req.params.id) !== number) return res.status(403).send([{message:"Category cannot be "}]);
    //63507a35f4be846a512482c2
    if(!ObjectId.isValid(req.params.id) )return res.status(403).send([{message:"password ID is invalid "}]);
    const password = await Password.findById(req.params.id).select("-__v");
    if(!password) return res.status(404).send("Could not find password with the given ID");
    const category = await Category.findById(password.category._id);
    if(!category) return res.status(403).send([{message:"Invalid category"}]);

    password.category.name = category.name;

    res.send(password);
});

//Create new password
router.post("/", auth, async (req, res) => {
    const { _id:loggedInUserId }  = req.user;
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(loggedInUserId);
    if(!user) return res.status(403).send([{message:"Invalid User"}]);

    const category = await Category.findById(req.body.categoryId);
    if(!category) return res.status(403).send("Invalid category");
    const password = new Password({
        fancyName: req.body.fancyName,
        userId: loggedInUserId,
        category: {_id: req.body.categoryId,name: category.name, userId: category.userId},
        siteUrl: req.body.siteUrl,
        username: req.body.username,
        password: req.body.password,
        description: req.body.description,
    });
    await password.save();
    res.send(password);
});

//Update password
router.put("/:id", auth, async(req, res)=>{
    const {error} = validate(req.body);
    const { _id:loggedInUserId }  = req.user;
    if(error) return res.status(400).send([{message: error.details[0].message}]);
    // const category =  Category.find({_id:req.body.categoryId});
    const category =  await Category.find({_id:req.body.categoryId});
    if(!category)return res.status(403).send("Category ID does not exist");
    let password = await Password.findByIdAndUpdate(req.params.id, {
  fancyName: req.body.fancyName,
        userId: loggedInUserId,
        category: {_id: req.body.categoryId,name: category.name, userId: category.userId},
        siteUrl: req.body.siteUrl,
        username: req.body.username,
        password: req.body.password,
        description: req.body.description,
    },{new:true} ).select("-__v");
    if(!password) return res.status(404).send("Could not find password with the given ID");
    
    let updatedpassword =  await Password.find({_id: password._id});
    updatedpassword[0].category.name = category[0].name;
    res.send(updatedpassword);
});

//Delete password
router.delete("/:id", auth, async (req, res) => {
    const password = await Password.findByIdAndRemove(req.params.id).select("-__v");
    if(!password) return res.status(404).send("Could not find password with the given ID");
    res.send(password);
});



module.exports = router;