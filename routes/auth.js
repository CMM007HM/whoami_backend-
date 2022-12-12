
const express = require('express');
const Joi =  require('joi');
const bcrypt = require('bcrypt');
const _ = require("lodash");
const router = express.Router();
const {User} = require('../models/users');

router.post("/", async(req, res) => {
    const {error} = validate(req.body);
    if(error){
  
        let data = {
            message: error.details[0].message,
            status: false
        }
        return res.status(400).send(data);
    }

    let user = await User.findOne({email: req.body.email});
    if(!user){
        let data = {
            message: 'Invalid username/password',
            status: false
        }
        return res.status(400).send(data);
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
        let data = {
            message: 'Invalid username/password',
            status: false
        }
        return res.status(400).send(data);
    }
    
    const token = user.generateAuthToken();
    let data = {
        token: token,
        user: _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'isAdmin']),
        status: true
    }
    res.send(data);
    
});

function validate(req){
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    });
    
    return schema.validate(req);
}


module.exports = router;