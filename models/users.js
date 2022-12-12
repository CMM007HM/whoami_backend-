const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
    },
    acceptTerms:{
        type: String,
    }
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'), {expiresIn: '24h'});
    return token
}

const User = mongoose.model("user", userSchema);


function validateUser(user){
    const schema = Joi.object({
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        company: Joi.string().min(6).required(),
        acceptTerms: Joi.boolean().required(),
        isAdmin: Joi.boolean(),
    });
    
    return schema.validate(user);
}


exports.validate = validateUser;
exports.User = User;
exports.userSchema = userSchema;