const express= require('express');
const routerProfile = express.Router();
const upload = require('../../middleware/upload')
const Profile = require('../../Model/Profile');
const User= require('../../Model/User');
const {check,validationResult} = require('express-validator');
const auth=require('../../middleware/auth');

//@route GET api/user
//@desc Test router
//@access Public

routerProfile.get('/me',auth,async(req,res)=>{
    await Profile.findOne({user:req.user.id}).then(()=> {console.error((err.message));res.status(500).send('Server Error')}).catch(err=>res.status(400).json({msg:"There is no profile linked to this account"}) )
})

routerProfile.post('/me',auth,upload.single('avatar'),[
    check('bio')
    .trim()
    .escape(),
],async(req,res)=>{
    const {dateofbirth,facebook,twitter,linkedin,instagram,website}=req.body;
    const profileField={};
    profileField.user=req.user.id;

    if(req.file)
        profileField.avatar=req.file.path;
    profileField.dateofbirth=dateofbirth;
    
    profileField.social={};
    if(facebook)
        profileField.social.facebook=facebook;
    if(twitter)
        profileField.social.twitter=twitter;
    if(linkedin)
        profileField.social.linkedin=linkedin;
    if(instagram)
        profileField.social.instagram=instagram;
    if(website)
        profileField.social.website=website;
    let profile=await Profile.findOne({user:req.user.id})
    if(profile){
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            profile = await Profile.findOneAndUpdate(
                {user:req.user.id},
                {$set:profileField},
                {new:true}
            );
            return res.json(profileField);
            
    }else{
        profile=new Profile(profileField);
        await profile.save();
        res.json({msg:"Profile Created"})
    }
})
module.exports = routerProfile;