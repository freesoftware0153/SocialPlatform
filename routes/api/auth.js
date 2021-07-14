/*the api/auth route requires authentication so we place middleware/auth.js
function first to authenticate the route and then get user data by get
and login by post as route is authenticated */
const express = require('express');
const router = express.Router();
//now implementing middleware auth into protected route of api
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

//whenever we want to add middleware simply add it as second parameter
//by doing that we make this route protected
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); //.select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// route   Post api/auth
// desc    authentication and get token
//access   public
router.post(
  '/',
  [
    //express validator checkup from here, this is to verify whether input
    //is valid and report any errors before
    //creating the user
    check('email', 'Please include an email').isEmail(),
    check('password', 'password is required').exists(),
  ], //upto here above sets the validation

  //checking for errprs in body
  async (req, res) => {
    const errors = validationResult(req); //find the validation errors in this request and wraps them in error object
    if (!errors.isEmpty()) {
      //if they dont include the above details properly it will send a
      //bad reqest of 400 and send back json
      return res.status(400).json({ errors: errors.array() });
    }
    // destructuring req.body to get mail and password,
    //otherwise everytime i have to use req.body.name

    const { email, password } = req.body; // password entered by user at loging time

    //see if user exists if not it should send back error
    try {
      let user = await User.findOne({ email }); //here we made request to database to get user

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password); //user.pasword which is stored in db

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id, //this user will give id as promise was returned above
          // by linth user
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          //inside the callback we get error or we get the token
          if (err) throw err;
          res.json({ token }); //if no error send back token to client
        }
      );
      //  res.send('User registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error'); //sice this is the last rs.status
      // we didnt use return before that we used return in everything
    }
  }
);

module.exports = router;
