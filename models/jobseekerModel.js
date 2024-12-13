const mongoose = require('mongoose')

const jobSeekerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email should be unique
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        // required: true,
    },
    resume: {
        type: String, // Store the resume file path or URL
        // required: true,
    },
    profilePic: {
        type: String, 
    },
    appliedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const jobSeekers = mongoose.model('jobSeekers', jobSeekerSchema);
module.exports = jobSeekers
