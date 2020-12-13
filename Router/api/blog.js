const express= require('express');
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
//@route GET api/blog
//@desc Test router
//@access Public

//@get all blogs
routerBlog.route('/')
.get(async(req,res,next) => {
    await Blog.find({})
    .then((blogs) => {
        res.json(blogs);
    }, (err) => next(err))
    .catch((err) => next(err));
}).post([
    check('title','Title is required').not(),
    check('text').isLength({min:1000}),
],upload.single('image'),async(req, res, next) => {
    const{title,metaTitle,text}=req.body;
    const article={};
    article.title=title;
    article.metaTitle=metaTitle;
    article.slug=slugTitle.slugUrl(title);
    article.text=text;
    article.updated=[new Date()];
    if(req.file)
        article.image=req.file.path;
        await Blog.findOne({slug:article.slug},async(err,blog)=>{
            if(blog){
                return res.status(400).json({ msg: "Blog already exist" });
            }
            blog=new Blog(article);
            await blog.save()
            .then((blog) => {
                console.log('Blog Created ', blog);
                res.json(blog);
            }, (err) => next(err))
        .catch((err) => next(err));
    })

})
.put(async (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(async(req, res, next) => {
    await Blog.remove({})
    .then((resp) => {
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

routerBlog.route('/:blogId')
.get(async (req,res,next) => {
    await Blog.findById(req.params.blogId)
    .then((blog) => {
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(async (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(async (req, res, next) => {
    await Blog.findByIdAndUpdate(req.params.blogId, {
        $set: req.body
    }, { new: true })
    .then((blog) => {
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(async (req, res, next) => {
    await Blog.findByIdAndRemove(req.params.blogId)
    .then((blog) => {
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
});

routerBlog.route('/:blogId/comments')
.get(async(req,res,next) => {
    await Blog.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null) {
            res.json(blog.comments);
        }
        else {
            err = new Error('Blog ' + req.params.dishId + ' not found');
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
    res.end('PUT operation not supported on /dishes/'
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
})
module.exports =routerBlog;