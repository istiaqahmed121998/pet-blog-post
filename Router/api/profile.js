const express= require('express');
const routerProfile = express.Router();
const upload = require('../../middleware/upload')
const Profile = require('../../Model/Profile');
const User= require('../../Model/User');
const {check,validationResult} = require('express-validator');
const auth=require('../../middleware/auth');
const cors = require('./cors');
//@route GET api/user
//@desc Test router
//@access Public

routerProfile.route('/me')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,auth.verifyUser,async(req,res)=>{
    await Profile.findOne({user:req.user.id}).populate(
        {path: 'user',
        model: 'user',
        select:{ 'hash': 0, 'salt': 0,'role':0,'active':0,'created':0}}).then((profile)=>{
        if(profile)
            res.json(profile);
        else
            res.status(400).json({msg:"There is no profile linked to this account"})
    })
})
.post(cors.corsWithOptions,auth.verifyUser,upload.single('avatar'),[
    check('bio')
    .trim()
    .escape(),
],async(req,res)=>{
    const {phone,dateofbirth,facebook,twitter,linkedin,instagram,website}=req.body;
    const profileField={};
    profileField.user=req.user.id;
    profileField.phone=phone

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
        res.status(401).json({ success: false, msg: "Profile is already created"});
    }else{
        profile=new Profile(profileField);
        await profile.save();
        await User.findOneAndUpdate({user:req.user.id}, {
            $set: {
                role:"writter"
            }
        }, { new: true })
        res.json({msg:"Profile Created"})
    }
}).
put(cors.corsWithOptions,auth.verifyUser,upload.single('avatar'),[
    check('bio')
    .trim()
    .escape(),
],async(req,res)=>{
    const {phone,dateofbirth,facebook,twitter,linkedin,instagram,website}=req.body;
    const profileField={};
    profileField.user=req.user.id;
    profileField.phone=phone

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
        res.status(401).json({ success: false, msg: "Profile is not created"});
    }
})
module.exports = routerProfile;