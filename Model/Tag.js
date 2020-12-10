const mongoose = require('mongoose');

module.exports = mongoose.model('tag',new mongoose.Schema({
    value:{
        type:String,
        required:true
    }
}));