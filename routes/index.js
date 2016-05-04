var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var auth = jwt({secret: process.env.SECRET, userProperty: 'payload'});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST route for registering users */
router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields.'});
	}
	// Create new User object, assign username and password
	var user = new User();
	user.username = req.body.username;
	user.setPassword(req.body.password);
	// Save user object in DB, generate and return token
	user.save(function(err){
		if(err){ return next(err);}
		return res.json({token: user.generateJWT()});
	});
});

/* GET route for authenticating users  */
router.get('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){ return res.status(400).json({message: 'Please fill out all fields.'});
	}
	/* authenticate user: if user exists generate token,
	else return info sent from DB */
	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }
		
		if(user){
			return res.json({token: generateJWT()});
		}
		else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

/* GET route for requesting all posts */
router.get('/posts', function(req, res, next){
	Post.find(function(err, posts){
		if(err){ return next(err); }
		res.json(posts);
	});
});

/* POST route for creating a post */
router.post('/posts', auth, function(req, res, next){
	var post = new Post(req.body);
	post.author = req.payload.username;
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
router.put('/posts/:post/upvote', auth, function(req, res, next){
	req.post.upvote(function(err, post){
		if(err){ return next(err); }
		res.json(post);
	});
});

/* POST route for creating and adding a comment to a post */
router.post('/posts/:post/comments', auth, function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;
	comment.author = req.payload.username;
	
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
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
	req.comment.upvote(function(err, comment){
		if(err){ return next(err); }
		res.json(comment);
	});
});

module.exports = router;
