const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// add your schemas
// use plugins (for slug)
// register your model



const UserSchema = new mongoose.Schema({
	username: String,
	email: String,
    password: {type: String, unique: true, required: true}
});


const ArticleSchema = new mongoose.Schema({
	title: String,
	url: String,
    description: String
});

ArticleSchema.plugin(URLSlugs("title"));

mongoose.model('User', UserSchema);
mongoose.model('Article', ArticleSchema);

mongoose.connect('mongodb://localhost/hw06');
