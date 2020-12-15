const https = require('https');
const fs = require('fs');
const express=require('express')
const bodyParser=require('body-parser');
const connectDB = require('./config/db')
const app=express();
var passport = require('passport');
var PORT = process.env.PORT || 5000;

const options = {
    key: fs.readFileSync('./bin/private.key'),
    cert: fs.readFileSync('./bin/certificate.pem')
  };
connectDB()
var server = https.createServer(options, app);
app.use(express.json());
app.get('/',(req,res)=>{
    res.send('API Running');
})
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/user',require('./Router/api/user'));
app.use('/api/profile',require('./Router/api/profile'));
app.use('/api/blog',require('./Router/api/blog'));
app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
})

server.listen(PORT+443, function(){
    console.log(`Server running at ${PORT+443}`)
});