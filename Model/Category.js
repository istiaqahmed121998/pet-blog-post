const mongoose = require('mongoose');

module.exports = mongoose.model('category',new mongoose.Schema({
    value:{
        type:String,
        required:true
    }
}));