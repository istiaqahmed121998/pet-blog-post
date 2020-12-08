const mongoose= require('mongoose');
const config = require('config');
const db = config.get('mongoURL');

module.exports = async()=>{
    try{
        await mongoose.connect(db,{
            useNewUrlParser:true,
            useUnifiedTopology: true 
        });
        console.log("Mongoose connected")
    }catch(err){
        console.error(err.message);
        process.exit(1)
    }
}