const mongoose = require('mongoose');

module.exports = mongoose.model('comment',new mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    created:{
        type:Date,
        default:Date.now
    },
    updated:[{
        type:Date
    }]
}));