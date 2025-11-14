var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	gid: { type: String, required: true, unique: true },
	uname: { type: String },
	email: { type: String, required: true, lowercase: true, match: [/.+@.+\..+/, 'Invalid email'] },
	level: { type: Number, value: 1 }
});

module.exports = userSchema;
