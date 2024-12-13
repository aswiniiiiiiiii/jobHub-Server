const mongoose = require('mongoose')

const recruiterSchema = new mongoose.Schema({
    // name: {
       //type: String,
       //required: true,
    // },
    company: {
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
        //required:true,
    },
    jobsPosted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],
    profilePic:{
        type: String
    },
   
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
});

const recruiters= mongoose.model('recruiters', recruiterSchema);
module.exports = recruiters