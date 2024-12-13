const mongoose = require('mongoose')


const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true,
    },
    location: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    minPrice: {
        type: String,
        required: true,
    },
    maxPrice: {
        type: String,
        required: true,
    },
    employmenttype:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    logo:{
        type:String,
        required:true
    },
    requirements: {
        type: [String], // Array of requirements
        required: true,
    },
    //appliedCandidates: [{
    //type: mongoose.Schema.Types.ObjectId,
    // ref: 'JobSeeker',
    // }],
    appliedDetails: [{
        jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: 'jobSeekers' },
        email: { type: String },
        resume: { type: String },
        appliedDate: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const jobs = mongoose.model('jobs', jobSchema);
module.exports = jobs
