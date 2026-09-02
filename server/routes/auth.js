const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');

const router = express.Router();

router.post('/register', registerValidation, validate, async (req, res, next) => {
  try {
    const { name, role, phone, email, location, language_pref, password, business_name, fpo_name } = req.body;
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.status(400).json({ success: false, error: 'Phone number already registered' });
    
    const password_hash = await bcrypt.hash(password, 10);
    // Auto-verify business users for demo or set default
    const is_verified = role === 'buyer' ? true : false;
    const user = await User.create({ 
      name, 
      role, 
      phone, 
      email, 
      location, 
      language_pref, 
      password_hash,
      business_name: business_name || (role === 'buyer' ? `${name}'s Enterprises` : null),
      is_verified,
      fpo_name: fpo_name || null
    });
    
    const token = jwt.sign({ 
      id: user.id, 
      role: user.role, 
      name: user.name,
      is_verified: user.is_verified,
      business_name: user.business_name
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role, 
          phone: user.phone, 
          location: user.location,
          business_name: user.business_name,
          is_verified: user.is_verified,
          fpo_name: user.fpo_name
        }
      }
    });
  } catch (err) { next(err); }
});

router.post('/login', loginValidation, validate, async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    
    const token = jwt.sign({ 
      id: user.id, 
      role: user.role, 
      name: user.name,
      is_verified: user.is_verified,
      business_name: user.business_name
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: {
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role, 
          phone: user.phone, 
          location: user.location,
          business_name: user.business_name,
          is_verified: user.is_verified,
          fpo_name: user.fpo_name
        }
      }
    });
  } catch (err) { next(err); }
});

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res, next) => {
  try {
    const { token, role } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'Token is required' });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      // If verification fails or client ID is not set, just mock it for demo if in dev
      if (process.env.NODE_ENV !== 'production' && !process.env.GOOGLE_CLIENT_ID) {
        payload = {
          sub: '1234567890',
          email: 'demo.user@example.com',
          name: 'Demo Google User'
        };
      } else {
        return res.status(401).json({ success: false, error: 'Invalid Google token' });
      }
    }

    const { email, name, sub } = payload;
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // create new user
      const password_hash = await bcrypt.hash(sub + process.env.JWT_SECRET, 10); // dummy pass
      user = await User.create({
        name,
        role: role || 'buyer',
        phone: sub.substring(0, 10), // mock phone
        email,
        location: 'Unknown',
        password_hash,
        is_verified: true
      });
    }

    const jwtToken = jwt.sign({ 
      id: user.id, 
      role: user.role, 
      name: user.name,
      is_verified: user.is_verified,
      business_name: user.business_name
    }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token: jwtToken,
        user: { 
          id: user.id, 
          name: user.name, 
          role: user.role, 
          phone: user.phone, 
          location: user.location,
          business_name: user.business_name,
          is_verified: user.is_verified,
          fpo_name: user.fpo_name
        }
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
