const express = require('express');
const router = express.Router();
const {Category, validate} = require('../models/categories');
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const ObjectId = require('mongoose').Types.ObjectId;

//Get all categories
router.get("/", auth, async (req, res)=> {
    const { _id:loggedInUserId }  = req.user;
    const categories =  await Category.find({userId: loggedInUserId}).select("-__v");
    res.send(categories);
});

// Get single category by ID
router.get("/:id", auth, async (req, res) =>{
    if(!ObjectId.isValid(req.params.id) )return res.status(403).send([{message:"Category ID is invalid "}]);
    const category = await Category.findById(req.params.id).select("-__v");
    if(!category) return res.status(404).send([{message:"Could not find category with the given ID"}]);
    res.send(category);
});

//Create new category
router.post("/", auth,  async (req, res) => {
    const { _id:loggedInUserId }  = req.user;
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    let category = new Category({name: req.body.name, userId: loggedInUserId});
    category.save();
    res.send(category);
});

//Update Category
router.put("/:id", auth, async(req, res)=>{
    if(!ObjectId.isValid(req.params.id) )return res.status(403).send([{message:"Category ID is invalid "}]);
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const category = await Category.findByIdAndUpdate(req.params.id, {name: req.body.name},{new:true} ).select("-__v");
    if(!category) return res.status(404).send([{message:"Could not find category with the given ID"}]);
    res.send(category);
});

//Delete category
router.delete("/:id", [auth, admin], async (req, res) => {
    if(!ObjectId.isValid(req.params.id) )return res.status(403).send([{message:"Category ID is invalid "}]);
    const category = await Category.findByIdAndRemove(req.params.id).select("-__v");
    if(!category) return res.status(404).send([{message:"Could not find category with the given ID"}]);
    res.send(category);
});

module.exports = router;