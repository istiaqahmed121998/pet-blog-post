const express= require('express');
const mongoose = require('mongoose');
const routerBlog = express.Router();
const upload = require('../../middleware/upload');
const slugTitle = require('../../middleware/slug');
const Blog = require('../../Model/Blog');
const Category = require('../../Model/Category');
const Comment=require('../../Model/Comment');
const Tag=require('../../Model/Tag');
const Profile=require('../../Model/Profile');
const User = require('../../Model/User');
const { check ,validationResult} = require('express-validator');
const auth=require('../../middleware/auth');
//@route GET api/blog
//@desc Test router
//@access Public
//@get all blogs
routerBlog.route('/')
.get(async(req,res,next) => {
    await Blog.find({}).populate("author tags categories","-phone -active -created -role -__v")
    .then((blogs) => {
        res.json(blogs);
    }, (err) => next(err))
    .catch((err) => next(err));
}).post([
    check('title','Title is required').not().isEmpty(),
    check('text').isLength({min:100}),
],auth.verifyUser,auth.verifyWritter,upload.single('image'),async(req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const{title,metaTitle,text,tag,category}=req.body;
        const article={};
        article.title=title;
        article.metaTitle=metaTitle;
        article.slug=slugTitle.slugUrl(title);
        article.text=text;
        article.updated=[new Date()];
        article.author=req.user.id;
        let tags=[];
        let categories=[]
        var uniqueTag = tag.split(',').filter((v, i, a) => a.indexOf(v) === i);
        var uniqueCategories=category.split(',').filter((v, i, a) => a.indexOf(v) === i);
        if(req.file)
            article.image=req.file.path;
        uniqueTag.forEach((v)=>{
            Tag.findOne({value:v},async(err,tag)=>{
                if(tag){
                    tags.push(tag.id);
                }
                else{
                    await new Tag({
                        value:v
                    }).save().then((tag)=>tags.push(tag.id))
                }
            }).catch(err=>next(err))
        });
        uniqueCategories.forEach((v)=>{
            //console.log(v);
            Category.findOne({value:v},async(err,category)=>{
                if(category){
                    categories.push(category.id);
                }
                else{
                    await new Category({
                        value:v
                    }).save().then((category)=>categories.push(category.id))
                }
                console.log(category);
            }).catch(err=>next(err))
        })
        console.log(tags);
        article.tags=tags;
        article.categories=categories;
        await Blog.findOne({slug:article.slug},async(err,blog)=>{
            if(blog){
                return res.status(400).json({ msg: "Blog already exist" });
            }
            blog=new Blog(article);
            await blog.save()
            .then((blog) => {
                res.json(blog);
            }, (err) => next(err))
            .catch((err) => next(err));
        });
    }
)
.put(async (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /blogs');
})
.delete(auth.verifyUser,auth.verifyAdmin,async(req, res, next) => {
    await Blog.remove({})
    .then((resp) => {
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});
routerBlog.route('/:slug')
.get(async (req,res,next) => {
    await Blog.findOne({slug:req.params.slug}).populate("author tags categories","-phone -active -created -role -__v")
    .then((blog) => {
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(async (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /blogs/'+ req.params.blogID);
})
.put(auth.verifyUser,auth.verifyWritter,async (req, res, next) => {
    await Blog.findOne({slug:req._parsedUrl.href}).then(async(blog)=>{
        console.log(req.user)
        if(blog.id==req.params.blogID && blog.author==req.user.id || req.user.role=='admin'){
            await Blog.findByIdAndUpdate(blog.id, {
                $set: req.body
            }, { new: true })
            .then((blog) => {
                res.json(blog);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            var err=new Error("You are not admin/Author of this blog");
            return res.status(401).send({ error : err.message })
        }
    }).catch((err) => next(err));
})
.delete(auth.verifyUser,auth.verifyWritter,async (req, res, next) => {
    await Blog.findOne({slug:req._parsedUrl.href}).then(async(blog)=>{
        if(blog.id==req.params.blogID && blog.author==req.user.id || req.user.role=='admin'){
            await Blog.findByIdAndRemove(blog.id)
            .then((blog) => {
                res.json(blog);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            var err=new Error("You are not admin/Author of this blog");
            return res.status(401).send({ error : err.message })
        }
    }).catch((err) => next(err));
    
});
routerBlog.route('/comments')
.get(async(req,res,next) => {
    await Blog.findById({slug:req._parsedUrl.href})
    .then((blog) => {
        if (blog != null) {
            res.json(blog.comments);
        }
        else {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(async(req, res, next) => {
    await Blog.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null) {
            blog.comments.push(req.body);
            blog.save()
            .then((blog) => {
                res.json(blog);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(async(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Blog/'
        + req.params.dishId + '/comments');
})
.delete(async(req, res, next) => {
    await Blog.findById(req.params.dishId)
    .then((blog) => {
        if (blog != null) {
            for (var i = (blog.comments.length -1); i >= 0; i--) {
                blog.comments.id(blog.comments[i]._id).remove();
            }
            blog.save()
            .then((blog) => {
                res.json(blog);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

routerBlog.route('/:blogId/comments/:commentId')
.get(async(req,res,next) => {
    await Blog.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null && blog.comments.id(req.params.commentId) != null) {
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(async(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
        + '/comments/' + req.params.commentId);
})
.put(async(req, res, next) => {
    await Blog.findById(req.params.dishId)
    .then((blog) => {
        if (blog != null && blog.comments.id(req.params.commentId) != null) {
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            dish.save()
            .then((blog) => {
                res.json(blog);                
            }, (err) => next(err));
        }
        else if (blog == null) {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(async(req, res, next) => {
    await Blog.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null && blog.comments.id(req.params.commentId) != null) {
            blog.comments.id(req.params.commentId).remove();
            blog.save()
            .then((blog) => {
                res.json(blog);                
            }, (err) => next(err));
        }
        else if (blog == null) {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});
routerBlog.get('/tag/:tag',async(req,res)=>{
    await Tag.findOne({value:req.params.tag},async(err,tag)=>{
        await Blog.find({
            'tags': { $in: 
                mongoose.Types.ObjectId(tag.id),

            }
        }, function(err, blog){
             res.json(blog);
        }).populate("author tags categories","-phone -active -created -role -__v");
    })
});
routerBlog.get('/category/:category',async(req,res)=>{
    console.log(req.params.category)
    await Category.findOne({value:req.params.category},async(err,category)=>{
        await Blog.find({
            'categories': { $in: 
                mongoose.Types.ObjectId(category.id),

            }
        }, function(err, blog){
             res.json(blog);
        }).populate("author tags categories","-phone -active -created -role -__v");
    })
});
module.exports =routerBlog;