const express= require('express');
const jwt = require('jsonwebtoken');
const config = require('config')
const {check,validationResult} = require('express-validator/check');
const bcrypt=require('bcrypt');
const routerUser = express.Router();

const User = require('../../Model/User');
//@route GET api/user
//@desc Test router
//@access Public

routerUser.get('/',(req,res)=>{
res.send('User Router');
})

routerUser.post('/create-user',[
    check('name','Name is requires').not().isEmpty(),
    // username must be an email
    check('email').isEmail(),
    // password must be at least 5 chars long
    check('password').isLength({ min: 5 }),
    
    check('passwordConfirmation').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  ],async (req,res,next)=>{
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const{name,email,password,phone}=req.body;
  
  try{
    let user=await User.findOne({email});
    if(user){
      return res.status(400).json({ msg: "User already exist" });
    }
  
    user = new User({
      name,
      email,
      password,
      phone
    });
    const salt =await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(password,salt);
  
    await user.save();
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
routerUser.post('/login',[ 
  //
  check('email').isEmail(),
  // password must be at least 5 chars long
  check('password').isLength({ min: 5 })]

  ,(req,res,next)=>{
})
module.exports = routerUser;