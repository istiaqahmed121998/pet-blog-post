const mongoose = require('mongoose');

const User=new mongoose.Schema({
    name:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type: String,
        enum : ['user','admin','writter'],
        default: 'user'
    
    },
    phone:{
        type:String,
        // unique:true
    },
    hash:{
        type:String,
        // required:true
    },
    salt:{
        type:String,
        // required:true
    },
    created:{
        type:Date,
        default:Date.now
    }
})
module.exports = mongoose.model('user',User);;