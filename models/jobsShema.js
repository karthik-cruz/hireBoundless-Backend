const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    experience: {   
        type: String,
    },
    skills: {
        type: String
    },
    qualification: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    salary: {
        type: String
    },
    address: {
        type: String
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }, // Recruiter ID
    postedDate: {
        type: Date,
        default: Date.now
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'application'
        }
    ]
});

module.exports = mongoose.model('Jobs', jobsSchema);
