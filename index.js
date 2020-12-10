const express=require('express')
const bodyParser=require('body-parser');
const connectDB = require('./config/db')
const app=express();

const PORT = process.env.PORT || 5000;


//
connectDB()

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/user',require('./Router/api/user'));
app.use('/api/profile',require('./Router/api/profile'));
app.use('/api/auth',require('./Router/api/auth'));
app.use('/api/blog',require('./Router/api/blog'));
app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
})