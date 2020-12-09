const mongoose = require('mongoose');

const UserScheme= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        default:'writer'
    },
    phone:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    created:{
        type:Date,
        default:Date.now
    }
});
module.exports = User= mongoose.model('user',UserScheme);