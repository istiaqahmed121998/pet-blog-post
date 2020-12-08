const express= require('express');
const jwt = require('jsonwebtoken');
const config = require('config')
const {check,validationResult} = require('express-validator');
const bcrypt=require('bcrypt');
const routerAuth = express.Router();
const auth=require('../../middleware/auth')

const User=require('../../Model/User')
//@route GET api/user
//@desc Test router
//@access Public

routerAuth.get('/',auth,async(req,res)=>{
    await User.findById(req.user.id).select('-password').then((user)=>{
        res.json(user);
    }).catch((err)=>{
        res.status(500).send(`Server Error`)
    })
})
routerAuth.post('/',[
    check('email').isEmail(),
    // password must be at least 5 chars long
    check('password').exists(),

  ],async (req,res)=>{
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const{email,password}=req.body;
  try{
    let user=await User.findOne({email});
    if(!user){
      return res.status(400).json({ msg: "Invalid Credential" });
    }
    let isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({ msg: "Invalid Credential" });
    }
    const payload={
      user:{
        id:user.id
      }
    }
    jwt.sign(payload,
      config.get('jwtSecret'),
      {expiresIn:360000},
      (err,token)=>{
        if (err) throw err;
        res.json({token})
      }
      )
  }
  catch(err){
    console.error(err.message);

    res.status(500).send(`Server Error`);

  }
  }
)
module.exports = routerAuth;