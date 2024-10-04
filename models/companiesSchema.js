const mongoose = require("mongoose");

const companiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    industry: {
        type: String,
    },
    location: {
        state: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        }
    },
    size: {
        type: String, //e.g number of employees
    },
    icon: {
        type: String
    },
    link: {
        type: String,
        trim: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },


}, { timestamps: true });

module.exports = mongoose.model("companies", companiesSchema)