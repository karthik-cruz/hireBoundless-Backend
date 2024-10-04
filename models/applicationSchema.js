const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobs',
        required: true
    },
    jobSeekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'interviewed', 'hired', 'rejected'],
        default: "applied",
        required: true
    },
    applicationDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('application', applicationSchema)