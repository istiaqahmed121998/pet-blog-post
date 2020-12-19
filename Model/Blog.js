const mongoose = require('mongoose');

module.exports = mongoose.model('blog',new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    metaTitle:{
        type:String
    },
    slug:{
        type:String,
        unique: true,
        required:true
    },
    summary:{
        type:String,
    },
    image:{
        type:String
    },
    text:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'profile'
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'comment'
        }
    ],
    tags:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'tag'
        }
    ],
    categories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'category'
        }
    ],
    likes:{
        
        type:Number,
        default:0
        
    },
    visit:{
        type:Number,
        default:0
    },
    created:{
        type:Date,
        default:Date.now
    },
    updated:[{
        type:Date,
        default:Date.now
    }]
}));