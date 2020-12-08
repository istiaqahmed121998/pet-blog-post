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

app.use('/api/user',require('./Router/api/user'));
app.use('/api/profile',require('./Router/api/profile'));
app.use('/api/auth',require('./Router/api/auth'));
app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
})