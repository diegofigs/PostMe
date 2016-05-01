var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET route for requesting all posts */
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
		if(err){ return next(err); }
		res.json(posts);
	});
});

/* POST route for creating a post */
router.post('/posts', function(req, res, next){
	var post = new Post(req.body);
	post.save(function(err, post){
		if(err){ return next(err); }
		res.json(post);
	});
});

/* PARAM route for preloading posts, helper function */
router.param('post', function(req, res, next, id){
	var query = Post.findById(id);
	
	query.exec(function(err, post){
		if(err){ return next(err); }
		if(!post){ return next(new Error('can\'t find post')); }
		
		req.post = post;
		return next();
	});
});

/* GET route for requesting post */
router.get('/posts/:post', function(req, res, next){
	req.post.populate('comments', function(err, post){
		if(err){ return next(err); }
		
		res.json(req.post);
	});
});

/* PUT route for upvoting entered post */
router.put('/posts/:post/upvote', function(req, res, next){
	req.post.upvote(function(err, post){
		if(err){ return next(err); }
		res.json(post);
	});
});

/* POST route for creating and adding a comment to a post */
router.post('/posts/:post/comments', function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	
	comment.save(function(err, comment){
		if(err){ return next(err); }
		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if(err){ return next(err); }
			res.json(comment);
		});
	});
});

/* PARAM route for preloading comments, helper function */
router.param('comment', function(req, res, next, id){
	var query = Comment.findById(id);
	
	query.exec(function(err, comment){
		if(err){ return next(err); }
		if(!comment){ return next(new Error('can\'t find comment')); }
		
		req.comment = comment;
		return next();
	});
});

/* PUT route for upvoting a comment */
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
	req.comment.upvote(function(err, comment){
		if(err){ return next(err); }
		res.json(comment);
	});
});

module.exports = router;
