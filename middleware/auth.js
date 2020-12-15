const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../Model/User')
const JwtStrategy=require('passport-jwt').Strategy;
const ExtractJwt=require('passport-jwt').ExtractJwt;
const jwt=require('jsonwebtoken');

const config=require('config');

exports.getToken=function(user){
    return jwt.sign(user,config.get('jwtSecret'),{expiresIn:'3500'});
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.get('jwtSecret');

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        User.findOne({_id: jwt_payload.user.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
}));

exports.verifyUser=passport.authenticate('jwt',{session:false})
exports.verifyAdmin=(req,res,next)=>{
    console.log(req.user.role);
    if(req.user.role!='admin') {
        var err=new Error("You are not admin");
        return res.status(401).send({ error : err.message })
    }
    else{
     return next();
    }
}
exports.verifyWritter=(req,res,next)=>{
    if(req.user.role=='user') {
        var err=new Error("You are not writter");
        return res.status(401).send({ error : err.message })
    }
    else{
     return next();
    }
}
exports.verifyAdmin=(req,res,next)=>{
    if(req.user.role=='admin') {
        return next();
    }
    else{
        var err=new Error("You are not admin");
        return res.status(401).send({ error : err.message })
    }
}