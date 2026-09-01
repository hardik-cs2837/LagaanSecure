const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validate, registerValidation, loginValidation } = require('../middleware/validate');

const router = express.Router();

router.post('/register', registerValidation, validate, async (req, res, next) => {
  try {
    const { name, role, phone, email, location, language_pref, password } = req.body;
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) return res.status(400).json({ success: false, error: 'Phone number already registered' });
    
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, role, phone, email, location, language_pref, password_hash });
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, role: user.role, phone: user.phone, location: user.location }
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
    
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, role: user.role, phone: user.phone, location: user.location }
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;\n