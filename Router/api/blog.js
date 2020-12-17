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
const cors = require('./cors');
const Utils=require('../../lib/utils');
const { findById } = require('../../Model/Blog');
mongoose.Promise=global.Promise
//@route GET api/blog
//@desc Test router
//@access Public
//@get all blogs
routerBlog.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,async(req,res,next) => {
    await Blog.find({}).populate("author tags categories","-phone -active -hash -salt -created -role -__v")
    .populate({ 
        path: 'comments',
        populate: {
          path: 'commenter',
          model: 'user',
          select:{ 'hash': 0, 'salt': 0,'role':0,'active':0,'created':0}
        },
        // 
     })
    // .populate('comments.commenter', '-hash -salt')
    .then((blogs) => {
        res.json(blogs);
    }, (err) => next(err))
    .catch((err) => next(err));
}).post(cors.corsWithOptions,[
    check('title','Title is required').not().isEmpty(),
    check('text').isLength({min:100}),
    check('tag','Tag is required').not().isEmpty(),
    check('category','Category is required').not().isEmpty(),
],auth.verifyUser,auth.verifyWritter,upload.single('image'),async(req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log(req.body)
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
            Category.findOne({value:v},async(err,category)=>{
                if(category){
                    categories.push(category.id);
                }
                else{
                    await new Category({
                        value:v
                    }).save().then((category)=>categories.push(category.id))
                }
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
.put(cors.corsWithOptions,async (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /blogs');
})
.delete(cors.corsWithOptions,auth.verifyUser,auth.verifyAdmin,async(req, res, next) => {
    await Blog.remove({})
    .then((resp) => {
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});
routerBlog.route('/:slug')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,async (req,res,next) => {
    await Blog.findOne({slug:req.params.slug}).populate("author tags categories","-phone -active -created -role -__v")
    .populate({ 
        path: 'comments',
        populate: {
          path: 'commenter',
          model: 'user',
          select:{ 'hash': 0, 'salt': 0,'role':0,'active':0,'created':0}
        },
        // 
     })
    .then((blog) => {
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,async (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /blogs/'+ req.params.blogID);
})
.put(cors.corsWithOptions,auth.verifyUser,auth.verifyWritter,async (req, res, next) => {
    Blog.findOne({slug:req.params.slug}).then(async(blog)=>{
        if(blog.id==req.params.blogID && blog.author==req.user.id || req.user.role=='admin'){
            const{title,metaTitle,text}=req.body;
            article={};
            if(title){
                article.title=title;
                article.slug=slugTitle.slugUrl(title);}

            if(metaTitle)
                article.metaTitle=metaTitle;
            if(text)
                article.text=text;
            var uniqueTag = tag.split(',').filter((v, i, a) => a.indexOf(v) === i);
            //var uniqueCategories=category.split(',').filter((v, i, a) => a.indexOf(v) === i);
            // try {
            //     const promises = uniqueTag.map(function (value) {
            //         //here i am assigning foreign key
            //         // let alldata = new League(body);
            //         // alldata.league_category_id = category._id;
            //         // return alldata.save();

            //         console.log()
            //         Tag.findOne(value,(err,tag)=>{
            //             if(tag){
            //                 blog.tags.push(tag.id);
            //                 blog.save();
            //             }
            //             else{
            //                 new Tag({
            //                     value:value
            //                 }).save().then((tag)=>{
            //                     blog.tags.push(tag.id);
            //                     blog.save();
            //                 })
            //             }
                        
            //         }).catch(err=>next(err))
            //     });
            //     await Promise.all(promises);
            // // uniqueTag.forEach(async(v)=>{
            // //     await Tag.findOne({value:v},async(err,tag)=>{
            // //         if(tag){
            // //             blog.tags.push(tag.id);
            // //             await blog.save();
            // //         }
            // //         else{
            // //             await new Tag({
            // //                 value:v
            // //             }).save().then(async(tag)=>{
            // //                 blog.tags.push(tag.id);
            // //                 await blog.save();
            // //             })
            // //             console.log(tag);
            // //         }
                    
            // //     }).catch(err=>next(err))
            // // });
            // // uniqueCategories.forEach(async(v)=>{
            // //     await Category.findOne({value:v},async(err,category)=>{
            // //         if(category){
            // //             blog.categories.push(category.id);
            // //             await blog.save();
            // //         }
            // //         else{
            // //             await new Category({
            // //                 value:v
            // //             }).save().then(async(category)=>{
            // //                 blog.categories.push(category.id);
            // //                 await blog.save();
            // //             })
            // //         }
            // //     }).catch(err=>next(err))
            // // })
            // }
            // catch (error) {
            //     return res.send({ status: 1, statusCode: "error", message: error.message });
            // }
            await Blog.findOneAndUpdate({slug:req.params.slug}, {
                $set: article,
                $push: {
                    updated:{$each:[new Date()]}
                }
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
.delete(cors.corsWithOptions,auth.verifyUser,auth.verifyWritter,async (req, res, next) => {
    await Blog.findOne({slug:req.params.slug}).then(async(blog)=>{
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
routerBlog.route('/:slug/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,async(req,res,next) => {
    await Blog.findOne({slug:req.params.slug})
    .populate({ 
        path: 'comments',
        populate: {
          path: 'commenter',
          model: 'user',
          select:{ 'hash': 0, 'salt': 0,'role':0,'active':0,'created':0}
        },
        // 
     })
    .then((blog) => {
        if (blog) {
            res.json(blog.comments);
        }
        else {
            err = new Error('Blog ' + req.params.slug + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(auth.verifyUser,cors.corsWithOptions,async(req, res, next) => {
    
    await Blog.findOne({slug:req.params.slug})
    .then(async(blog) => {
        if (blog) {
            await new Comment({
                comment:req.body.comment,
                commenter:req.user.id
            }).save().then(async(comment)=>{
                blog.comments.push(comment.id);
                await blog.save()
                .then((blog) => {
                    res.json(blog);                
                }, (err) => next(err));
            })
        }
        else {
            err = new Error('Blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,async(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Blog/'
        + req.params.dishId + '/comments');
})
.delete(cors.corsWithOptions,async(req, res, next) => {
    await Blog.findById(req.params.dishId)
    .then((blog) => {
        if (blog) {
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

routerBlog.route('/:slug/comments/:commentID')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,async(req,res,next) => {
    await Blog.findOne({slug:req.params.slug})
    .then(async(blog) => {
        if(blog){
            if(blog.comments.indexOf(req.params.commentID)!==-1){
                await Comment.findById(req.params.commentID)
                .populate({ 
                      path: 'commenter',
                      model: 'user',
                      select:{ 'hash': 0, 'salt': 0,'role':0,'active':0,'created':0}
                    
                    // 
                 })
                .then((comment)=>{
                    res.send(comment);
                })
            }
            else return res.status(400).json({ msg: "Comment already exist" });
        }
        else return res.status(400).json({ msg: "Blog already exist" });
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,async(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId
        + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions,async(req, res, next) => {
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
.delete(cors.corsWithOptions,async(req, res, next) => {
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
routerBlog
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/tag/:tag',cors.cors,async(req,res)=>{
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
routerBlog
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/category/:category',cors.cors,async(req,res)=>{
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

routerBlog.route('/page/:number/limit/:limit').get(Utils.paginatedResults(Blog), (req, res) => {
    res.json(res.paginatedResults)
  })
module.exports =routerBlog;