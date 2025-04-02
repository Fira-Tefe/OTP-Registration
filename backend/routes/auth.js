const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

// Register User
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6+ characters').isLength({ min: 6 }),
  check('phoneNumber', 'Phone number is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { username, email, phoneNumber, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return errorResponse(res, 400, 'User already exists');

    user = new User({ username, email, phoneNumber, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id, email: user.email, username: user.username } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ 
        success: true, 
        token,
        user: { id: user.id, username, email, phoneNumber }
      });
    });
  } catch (err) {
    console.error(err.message);
    errorResponse(res, 500, 'Server error');
  }
});

// Login User
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match:', isMatch); // Debug log
      
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }
  
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5d' },
        (err, token) => {
          if (err) {
            console.error('JWT error:', err);
            return res.status(500).json({ 
              success: false,
              message: 'Error generating token' 
            });
          }
          res.json({
            success: true,
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              phoneNumber: user.phoneNumber
            }
          });
        }
      );
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  });

module.exports = router;