var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
	hash: String,
	salt: String
});

UserSchema.methods.setPassword = function(password){
	// salt is a 128 bit string in hex format
	this.salt = crypto.randomBytes(16).toString('hex');
	
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password){
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	
	return this.hash === hash;
};

UserSchema.methods.generateJWT = function(){
	var today = new Date();
	var exp = new Date();
	exp.setDate(today.getDate + 60);
	
	return jwt.sign({
		_id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime/1000)
	}, process.env.SECRET );
};

mongoose.model('User', UserSchema);