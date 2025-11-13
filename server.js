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

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home',(req,res) => {
    if (!req.isAuthenticated()) {
        res.render('home', {req: req, msg: "Please login to unlock all features."});
    } else {
        res.render('home', {req: req, user: req.user, msg: `Welcome, ${req.user.displayName}.`});
    }
});

app.get('/user', isOauthed, (req, res) => {
    console.log(`Logged in as ${req.user.id}, ${req.user.email}`);
    res.render('user', {user: req.user, req: req});
});

app.get('/game', isOauthed, (req,res) => {
    res.render('game', {req: req});
});

app.get('/study', isOauthed, (req,res) => {
    res.render('study', {req: req});
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
       return res.redirect('/home');
    };
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
