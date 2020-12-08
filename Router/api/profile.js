const express= require('express');
const routerProfile = express.Router();

//@route GET api/user
//@desc Test router
//@access Public

routerProfile.get('/',(req,res)=>{
res.send('User Router');
})
module.exports = routerProfile;