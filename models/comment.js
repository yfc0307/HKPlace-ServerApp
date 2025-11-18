var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	location: { type: String, required: true },
	gid: { type: String, required: true }, // this is the gid
	content: { type: String, required: true },
	time: { type: String, required: true }
});

module.exports = commentSchema;
