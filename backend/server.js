require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken'); // Added missing jwt require

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // = 14 days
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
  passReqToCallback: true // Added to access req in callback
},
async (req, accessToken, refreshToken, profile, done) => { // Added req parameter
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        phoneNumber: '+251955668350',
        password: '$2b$10$MbutQUd7YVswFe6blNzDBOV39MmFYMsVOns2S7d8YN52d0TUDt8Ri'
      });
      await user.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google auth routes
app.get('/api/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Added to always show account selection
  })
);

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false // Changed to false since we're using JWT
  }),
  (req, res) => {
    // Successful authentication
    const payload = { 
      user: { 
        id: req.user.id, 
        email: req.user.email, 
        username: req.user.username 
      } 
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (err, token) => {
        if (err) {
          console.error('JWT signing error:', err);
          return res.redirect('http://localhost:3000/login?error=token_error');
        }
        
        // Set the token in a cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 5 // 5 days
        });
        
        res.redirect('http://localhost:3000/auth-success');
      }
    );
  }
);

// Other routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));