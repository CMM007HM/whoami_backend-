const Joi = require('joi');
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyAddress: {
        type: String
    },
    companyCity: {
        type: String,
    },
    companyState: {
        type: String,
    },
    companyZipcode: {
        type: String
    },
    companyCountry: {
        type: String,
    },
    companyPhone: {
        type: String,
    },
    companyEmail: {
        type: String,
    },
    userId: {
        type: String,
        required: true,
    }
});

const Company = mongoose.model('Company', companySchema);


function validateCompany(company){
    const schema = Joi.object({
        companyName: Joi.string().min(3).required(),
    });
    
    return schema.validate(company);
}


exports.Company = Company;
exports.validate = validateCompany;
exports.companySchema = companySchema