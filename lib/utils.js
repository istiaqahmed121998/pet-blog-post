const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('config');
function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    console.log(hashVerify);
    console.log(hash)
    return hash === hashVerify;
}
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}
function issueJWT(user) {
  
    const expiresIn = '1d';
  
    const payload={
        user:{
          id:user.id
        }
    }
    // const signedToken = jwt.sign(payload, config.get('jwtSecret'), { expiresIn: expiresIn, algorithm: 'RS256' });
    // return {
    //   token: "Bearer " + signedToken,
    //   expires: expiresIn
    // }
    return jwt.sign(payload,
        config.get('jwtSecret'),
        {expiresIn:expiresIn}
    );
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword; 
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT; 