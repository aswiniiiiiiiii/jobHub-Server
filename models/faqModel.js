const mongoose = require('mongoose')

const faqSchema = new mongoose.Schema({
    question:{
        type:String,
        required:true
    },
    answer:{
        type:String,
        required:true
    }
})

const faqs = mongoose.model("faqs",faqSchema)
module.exports = faqs