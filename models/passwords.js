const Joi = require('joi');
const mongoose = require('mongoose');
const {categorySchema} = require('./categories');

const passwordSchema = new mongoose.Schema({
    fancyName: {
        type: String,
        required: true,
    },
    userId:{
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    category:{
        type: categorySchema,
        required: true
    },
    description: {
        type: String,
    },

});

const Password = mongoose.model('Password', passwordSchema);

function validatePassword(password){
    const schema = Joi.object({
        fancyName: Joi.string(),
        categoryId: Joi.objectId().required(),
        description: Joi.string(),
        password: Joi.string().required(),
        username: Joi.string().required(),
    });
    
    return schema.validate(password);
}

exports.Password = Password;
exports.validate = validatePassword;