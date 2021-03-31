const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');

const app = express();


const UserSchema = mongoose.model('User');
const ArticleSchema = mongoose.model('Article');


app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));

// add req.session.user to every context object for templates
app.use((req, res, next) => {
    // now you can use {{user}} in your template!
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/article/add', (req, res) => {
});

app.post('/article/add', (req, res) => {
});

// come up with a url for /article/slug-name!
// app.get('add url here!', (req, res) => {
// });


//Render a template, register.hbs that contains a form register.hbs
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {

    function success(user) {
        auth.startAuthenticatedSession(req, user, function cb() {
            res.redirect('/');
        });
    };
    
    function error(err) {
        res.render('register', {message: err.message});
    };

    auth.register(req.body.username, req.body.email, req.body.password, error, success);
        
});




app.get('/login', (req, res) => {
});

app.post('/login', (req, res) => {
});

app.listen(3000);
