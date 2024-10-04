const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Number
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "jobSeeker",
        enum: ['admin', 'jobSeeker', 'recruiter'],
        required: true
    },
    profile: {
        resume: {
            type: String
        }, // for jobSeeker
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'companies'
        }, // for recruiter
        avatar: {
            type: String
        }
    }

}, { timestamps: true });

module.exports = mongoose.model('users', usersSchema)