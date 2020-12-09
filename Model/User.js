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
    avatar:{
        default:null,
        type:String
    },
    created:{
        type:Date,
        default:Date.now
    }
});
UserScheme.statics.getUser = function (email) {
    return this.find({ email});
}
module.exports = User= mongoose.model('user',UserScheme);