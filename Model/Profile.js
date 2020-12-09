const mongoose = require('mongoose');


const profileSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'

    },
    avatar:{
        type:String,
        default:null
    },
    dateofbirth:{
        type:Date,
    },
    bio:{
        type:String
    },
    social:
    {
        facebook:
        {
            type:String,
            default:null
        },
        twitter:{
            type:String,
            default:null
        },
        linkedin:{
            type:String,
            default:null
        },
        instagram:{
            type:String,
            default:null
        },
        website:{
            type:String,
            default:null
        }
    }
});
module.exports = User = mongoose.model('profile',profileSchema);