const express= require('express');
const routerProfile = express.Router();

const Profile = require('../../Model/Profile');
const User= require('../../Model/User');

const auth=require('../../middleware/auth');

//@route GET api/user
//@desc Test router
//@access Public

routerProfile.get('/me',auth,async(req,res)=>{
    await Profile.findOne({user:req.user.id}).then(()=> {console.error((err.message));res.status(500).send('Server Error')}).catch(err=>res.status(400).json({msg:"There is no profile linked to this account"}) )
})
module.exports = routerProfile;