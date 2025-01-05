const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const Department = require('../models/Department');
const { checkUser } = require('../middleware/authMiddleware');

const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge
  });
};

exports.signup_get = (req, res) => {
  res.render('signup');
};

exports.login_get = (req, res) => {
  res.render('login');
};


exports.signup_post = async (req, res) => {
  const { name, email, password, department, designation } = req.body;

  try {
    // Step 1: Create the user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      department, 
      designation 
    });

    // Step 2: Find the department and update the faculty count
    const departmentDoc = await Department.findOne({ name: department });
    if (!departmentDoc) {
      return res.status(404).send('Department not found');
    }

    // Increment faculty count
    departmentDoc.facultyCount += 1;

    // Save the department with updated faculty count
    await departmentDoc.save();

    // Step 3: Create token and send response
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw Error('Incorrect email');
    }
    
    const auth = await user.comparePassword(password);
    if (!auth) {
      throw Error('Incorrect password');
    }

    const token = createToken(user._id);
    checkUser;
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/research');
};

exports.forgot_password = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password Reset Request',
    //   message: `To reset your password, click the link: ${resetURL}`
    // });

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};