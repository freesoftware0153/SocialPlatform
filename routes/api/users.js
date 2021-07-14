const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
// route   Post api/users
// desc    register user and user has to enter correct data when they make request
//access   public
const User = require('../../models/User');
router.post(
  '/',
  [
    //express validator checkup from here, this is to verify whether input
    //is valid and report any errors before
    //creating the user
    check('name', 'Name is required' /*error msg if empty*/).not().isEmpty(),
    check('email', 'Please include an email').isEmail(),
    check(
      'password',
      'please enter password of 6 or more than 6 characters'
    ).isLength({ min: 6 }),
  ], //upto here above sets the validation

  async (req, res) => {
    const errors = validationResult(req); //find the validation errors in this request and wraps them in error object
    if (!errors.isEmpty()) {
      //if they dont include the above details properly it will send a
      //bad reqest of 400 and send back json
      return res.status(400).json({ errors: errors.array() });
    }
    // destructuring req.body to get name,mail and password,
    //otherwise everytime i have to use req.body.name

    const { name, email, password } = req.body;

    //see if user exists if not it should send back error
    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //get users gravatar --this will only run when user is not found
      const avatar = gravatar.url(email, {
        s: '200', //options size of string
        r: 'pg', // no naked pics
        d: 'mm', // default can use 404 instead of mm
      });
      //created instance of a user here and we hv to save it to databse but
      // brfore we have to encryopt the passwd using bcrypt
      user = new User({
        name,
        email, // create the user
        avatar,
        password,
      });

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      //hash the password
      user.password = await bcrypt.hash(password, salt);

      await user.save(); // promise we hv to use await there
      //Return jasonwebtoken so in frontend when user logged in,it remains   //save user in  db
      // looged in do not logged out or expires after given seconds
      const payload = {
        user: {
          id: user.id, //this user will give id as promise was returned above
          // by 61 linth user
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
