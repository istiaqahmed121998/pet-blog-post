const express= require('express');
const routerAuth = express.Router();

//@route GET api/user
//@desc Test router
//@access Public

routerAuth.get('/',(req,res)=>{
res.send('Auth Router');
})
module.exports = routerAuth;