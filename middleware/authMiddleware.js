const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.redirect('/login'); // Redirect if no token is found
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database
    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.redirect('/login'); // Redirect if user not found
    }

    // Attach the user to the request object
    req.user = user;
    // console.log('Authenticated User:', req.user); // Debugging log

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // console.error('Authentication error:', err);
    res.redirect('/login'); // Redirect on error
  }
};
const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.id);
      // console.log("locals.user set succesfully"+user);
      res.locals.user = user;
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};


module.exports = { requireAuth, checkUser };