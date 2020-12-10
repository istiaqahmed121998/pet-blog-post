const express= require('express');
const routerBlog = express.Router();
const Blog = require('../../Model/Blog');
const Category = require('../../Model/Category');
const Comment=require('../../Model/Comment');
const Tag=require('../../Model/Tag');
const Profile=require('../../Model/Profile');
const User = require('../../Model/User')
//@route GET api/blog
//@desc Test router
//@access Public

//@get all blogs
routerBlog.get('/',async(req,res)=>{
    res.send('blogs');
    await User.findById(req.user.id).select('-password').then((user)=>{
        res.json(user);
    }).catch((err)=>{
        res.status(500).send(`Server Error`)
    })
    await Blog.find({}, function(err, blogs) {
    var blogMap = {};
    blogs.forEach(function(blog) {
        blogMap[blogs._id] = blog;
    });
        res.send(blogMap);  
    });
});

//@post a new blog
routerBlog.post('/new',async(req,res)=>{
    res.send('blog post');//check user profile is created or not.If not created then err and if created then blog will be post by this profile.
});

//@get a specific blog
routerBlog.get('/:id',async(req,res)=>{
    res.send('blog post'+req.params.id);
});

//@edit a specific blog
routerBlog.post('edit/:id',async(req,res)=>{
    res.send('blog post'+req.params.id);
});

//@post a comment on a specific blog

routerBlog.post('/:id/comment',async(req,res)=>{
    res.send('new comment '+req.params.id);
});

//@edit a comment on a specific blog
routerBlog.post('/:id/edit/comment/:id',async(req,res)=>{
    res.send('new comment '+req.params.id);
});

module.exports =routerBlog;