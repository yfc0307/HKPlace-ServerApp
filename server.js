const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Below is mongoose part

const uri = process.env.MONGODB_URI;

const mongoose = require('mongoose');

const userSchema = require('./models/user');
const commentSchema = require('./models/comment');
const User = mongoose.model('User', userSchema);
const Comment = mongoose.model('comments', commentSchema);

async function mongoConnect() {
    await mongoose.connect(uri);
    console.log('Mongoose Connected');
}

mongoConnect()
	.catch((err) => console.log(err))
	.finally()

// Below is OAuth

require('./oauth');

const passport = require('passport');

app.set('view engine', 'ejs');

const session = require('express-session');
app.use(session({ 
  secret: process.env.SESSION_SECRET || "hkplace", // Use env variable
  resave: false, 
  saveUninitialized: false, 
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CRITICAL
    maxAge: 60*60*1000,
    domain: process.env.COOKIE_DOMAIN || undefined // May need to set this
  },
  proxy: true // IMPORTANT for cloud deployments behind reverse proxies
})); // cookie only lasts 60 mins
app.set('trust proxy', 1); // Trust first proxy (Render.com uses proxies)
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


// Routings

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

app.get('/user', isOauthed, async (req, res) => { try {
    const userData = await User.findOne({ gid: req.user.id }, '-_id').lean().exec();
    //console.log(userData.email);
    //console.log(userData.uname);
    //console.log(userData.level);
    res.render('user', {user: req.user, req: req, email: userData.email, uname: userData.uname, level: userData.level});
} catch (err) { 
    console.log('DB error:', err);
    res.status(500).send('Server error');
}});


// User Edit

app.get('/user/edit', isOauthed, async (req, res) => { try {
    const userData = await User.findOne({ gid: req.user.id }, '-_id').lean().exec();
    
    if (!userData) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.render('useredit', {user: req.user, req: req, email: userData.email, uname: userData.uname, level: userData.level});
} catch (err) { 
    console.log('DB error:', err);
    res.status(500).send('Server error');
}});

app.post('/user/edit/', isOauthed, async (req, res) => {
    try {
        const new_uname = req.body.uname;
        
        const updateResult = await User.findOneAndUpdate(
            { gid: req.user.id },
            { uname: new_uname },
            { new: true } // Returns the updated document
        ).exec();
        
        if (!updateResult) {
            return res.status(404).send('User not found');
        }
        
        console.log(new Date().toString(), `Updated user: ${updateResult}`);
        res.redirect('/user');
        
    } catch (err) {
        console.log('Update error:', err);
        res.status(500).send('Server error');
    }
});


app.get('/add/comment/:location', isOauthed, async (req, res) => {
    try {
        const location = req.params.location;
        if (!location) {
            return res.status(400).json({ error: 'Missing location parameter.'});
        }
        
        const userData = await User.findOne({ gid: req.user.id }).lean().exec();
        
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.render('addcomment', { req: req, uname: userData.uname, location: location, gid: req.user.id });
    } catch (err) {
        console.log('Update error:', err);
        res.status(500).send('Server error');
    }
});

app.post('/add/comment/', isOauthed, async (req, res) => {
    try {
        const location = req.body.location;
        const gid = req.body.gid;
        const content = req.body.content;
        
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            location: location,
            gid: gid,
            content: content,
            time: new Date().toString()
        });
        
        const updateResult = await newComment.save();
        
        console.log(new Date().toString(), `Added comment by ${gid}`);
        res.redirect('/home');
        
    } catch (err) {
        console.log('Update error:', err);
        res.status(500).send('Server error');
    }
});


// RESTful API for demo POST
// CURD Command: curl -X POST -d 'location=Stanley&content=Good' "localhost:3000/api/add/comment/"
app.post('/api/add/comment/', async (req, res) => {
    try {
        const location = req.body.location;
        const gid = 'Guest';
        const content = req.body.content;
        
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            location: location,
            gid: gid,
            content: content,
            time: new Date().toString()
        });
        
        const updateResult = await newComment.save();
        
        console.log(new Date().toString(), `Added comment by ${gid}`);
        
    } catch (err) {
        console.log('Update error:', err);
        res.status(500).send('Server error');
    }
});

// RESTful API for demo DELETE using parameters in URL
// CURD Command: curl -X DELETE "localhost:3000/api/delete/comment/Guest"
app.delete('/api/delete/comment/:gid', async (req, res) => {
    try {
        if (!req.params.gid) {
            return res.status(400).json({ error: 'Missing gid parameter.'});
        }
        
        const deleteResult = await Comment.deleteMany({ gid: req.params.gid });
        
        if (deleteResult) {
            console.log(new Date().toString(), `Deleted comments: ${deleteResult.acknowledged}, ${deleteResult.deletedCount} document deleted`);
        } else {
            console.log(new Date().toString(), `Delete comments failed.`);
        }
    } catch (err) {
        console.log('Update error:', err);
        res.status(500).send('Server error');
    }
});


app.get('/game', isOauthed, (req,res) => {
    res.render('game', {req: req});
});

app.get('/study', isOauthed, (req,res) => {
    res.render('study', {req: req});
});

app.get('/oauth/google/callback', 
    passport.authenticate('google', {
        successRedirect: '/oauth/success',
        failureRedirect: '/oauth/failure',
    })
);

app.get('/oauth/success', async (req, res) => {
  try {
    console.log(new Date().toString(), `${req.user.id} Login`);
    // wait for DB result
    const existing = await User.findOne({ gid: req.user.id }).exec();
    //console.log(req.user.displayName);
    if (!existing) {
      // create new user only if not found
      const user = new User({
        gid: req.user.id,
        uname: req.user.displayName,
        email: req.user.email,
        level: 1
      });
      //console.log(user);
      await user.save();
      console.log(new Date().toString(), 'New user created:', user._id);
    } else {
      console.log(new Date().toString(), 'User exists:', existing._id);
      // optionally update existing user's info here
    }

    res.redirect('/user');
  } catch (err) {
    console.error('Error in /oauth/success:', err);
    res.status(500).send('Server error');
  }
});

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
       console.log(new Date().toString(), `${req.user.id} Logout`);
       res.clearCookie('connect.sid', { path: '/' });
       return res.redirect('/home');
    };
  });
});

app.listen(PORT, () => {
  console.log(new Date().toString(), `Server is running on ${PORT}`);
});









