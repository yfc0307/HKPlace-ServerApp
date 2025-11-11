const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

require('./oauth');

const passport = require('passport');

const session = require('express-session');
app.use(session({ secret: "hkplace" }));
app.use(passport.initialize());
app.use(passport.session());

// Middleware function to check if oauth or not
function isOauthed(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}



app.use(express.static('public'));
app.use("/img", express.static('/public/assets/img')); // virtual path
app.use("/home", express.static('/public/index')); // virtual path

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

app.get('/',(req,res) => {
    res.send('<a href="/oauth/google">Authenticate with Google</a>');
});

app.get('home', isOauthed, (req, res) => {
    res.sendFile('')
})

app.get('oauth/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/home',
        failureRedirect: '/oauth/failure',
    })
)

app.get('/oauth/failure', (req,res) => {
    res.send('Authentication Failed');
})

app.get('/oauth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
)

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
})