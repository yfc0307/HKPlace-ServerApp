const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('./oauth');

const passport = require('passport');

app.set('view engine', 'ejs');

const session = require('express-session');
app.use(session({ secret: "hkplace", resave: false, saveUninitialized: false, cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60*60*1000 } }));
// cookie only lasts 60 mins
app.use(passport.initialize());
app.use(passport.session());

const cookieParser = require('cookie-parser');

// Middleware function to check if oauth or not
function isOauthed(req, res, next) {
    req.user ? next() : res.redirect('/home');
}

app.use(cookieParser());
app.use(express.static('public'));
app.use("/img", express.static('/public/assets/img')); // virtual path

app.get('/', isOauthed, (req, res) => {
    res.redirect('/user');
});

app.get('/home',(req,res) => {
    res.render('home');
});

app.get('/user', isOauthed, (req, res) => {
    console.log('Logged in');
    res.render('user', {user: req.user});
});

app.get('/oauth/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/user',
        failureRedirect: '/oauth/failure',
    })
);

app.get('/oauth/failure', (req,res) => {
    res.send('Authentication Failed');
});

app.get('/oauth/google',
    passport.authenticate('google', { scope: ['email', 'profile'], prompt: 'select_account' })
);

app.get('/logout', isOauthed, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
       return res.send('err');
    } else {
       res.clearCookie('connect.sid', { path: '/' });
       return res.redirect('/');
    };
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
