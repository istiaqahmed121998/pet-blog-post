const express= require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check,validationResult} = require('express-validator');
const routerUser = express.Router();
const auth=require('../../middleware/auth');
const User = require('../../Model/User');
const utils=require('../../lib/utils');

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
  ],
  async (req,res,next)=>{
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
      const saltHash = utils.genPassword(password);

      const salt = saltHash.salt;
      const hash = saltHash.hash;
      user = new User({
        name,
        email,
        hash,
        salt,
        phone,
      });
      
    
      await user.save();
      res.json({success: true, token: utils.issueJWT(user), status: 'You are successfully signed up!'});
    }  catch(err){
      console.error(err.message);
  
      res.status(500).send(`Server Error`);
  
    }
  }  
);
routerUser.post('/login', (req, res,next) => {
  const {email,password}=req.body;
  User.findOne({ email })
  .then((user) => {

      if (!user) {
          res.status(401).json({ success: false, msg: "could not find user" });
      }

      // Function defined at bottom of app.js

      const isValid = utils.validPassword(password, user.hash, user.salt);
      

      if (isValid) {

          res.status(200).json({ "success": true, "token": utils.issueJWT(user) });

      } else {

          res.status(401).json({ success: false, msg: "you entered the wrong password" });

      }

  })
  .catch((err) => {   
      return next(err);
  });
});
routerUser.get('/userlist',auth.verifyUser,auth.verifyAdmin,async(req,res)=>{
  await User.find({})
  .then((blogs) => {
      res.json(blogs);
  }, (err) => next(err))
  .catch((err) => next(err));
});
routerUser.get('/protectedWritter',auth.verifyUser,auth.verifyWritter,async(req,res)=>{

  res.send('writter');
});
module.exports = routerUser;