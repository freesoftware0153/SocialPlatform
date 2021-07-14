/*here we are going to create so many routes starting with route to
our profile*/
const express = require('express');
const { check, validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const router = express.Router();
const request = require('request');
const config = require('config');

//private as we r getting the user id by token and which is private,so the
//client has to send token for that auth middleware should invoke to
//protect and authenticate our route of /me
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

/* route  Get api/profile/me
   desc   route to my own profile
   access private*/

router.get('/me', auth, async (req, res) => {
  try {
    //from auth middlware fn we get req.user through which we find id
    // by token of the user to our protected route api/profile/me
    // by User model we populate user with second parameter as an array
    // by profile model we find user which related to user of model
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile' });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'server Error' });
  }
  //  res.send('my profile route');
});

/* route  Get api/profile
   desc   create or update profile
   access private*/

router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').notEmpty(),
      check('skills', 'skills are required').notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //   res.send('creating profile');

    // now will extract all fields from body object passed by body parser
    // destructure the request
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check...rest
    } = req.body;

    // create profile object
    const myprofile = {};
    myprofile.user = req.user.id;
    if (company) myprofile.company = company;
    if (website) myprofile.website = website;
    if (location) myprofile.location = location;
    if (bio) myprofile.bio = bio;
    if (status) myprofile.status = status;
    if (githubusername) myprofile.githubusername = githubusername;
    if (skills) {
      myprofile.skills = skills.split(',').map((skill) => skill.trim());
    }
    // console.log(myprofile.skills);

    //social object profile
    myprofile.social = {};
    if (youtube) myprofile.social.youtube = youtube;
    if (twitter) myprofile.social.twitter = twitter;
    if (instagram) myprofile.social.instagram = instagram;
    if (linkedin) myprofile.social.linkedin = linkedin;
    if (facebook) myprofile.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: myprofile },
          { new: true }
        );

        return res.json(profile);
      }

      // create profile
      profile = new Profile(myprofile);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ msg: 'Server Error' });
    }
    // res.send('in profile');
  }
);
module.exports = router;

/* route  Get api/profile
   desc   get to all profile
   access public*/

router.get('/', async (req, res) => {
  try {
    profile = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/* route  Get api/profile/user/user_id
   desc   get to a profile by user-id
   access public*/

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      res.status(400).json({ msg: 'profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

/* route  DELETE api/profile
   desc   delete
   access private*/

router.delete('/', auth, async (req, res) => {
  try {
    //remove post
    await Post.deleteMany({ user: req.user.id });
    //removes profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //removes user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json('User removed');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
//its an array and not a document still have its own id in database
//one of ggreatest thing about document database or no sql db like mongoDb
//we can have structure in one document rather than having separate
//experience table and then adding doing all relationship stuff
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').notEmpty(),
      check('company', 'Company is required').notEmpty(),
      check(
        'from',
        'From date is required and needs to be from the past'
      ).notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;
    const newexp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newexp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     DELETE profile experience
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Find Index of experience to be removed

    const rindex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(rindex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').notEmpty(),
      check('degree', 'degree is required').notEmpty(),
      check('fieldofstudy', 'fieldofstudy is required').notEmpty(),
      check(
        'from',
        'From date is required and needs to be from the past'
      ).notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newedu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newedu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     DELETE profile education
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Find Index of experience to be removed

    const rindex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(rindex, 1);

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile/github/:username
// @desc     get user repos from github
// @access   Publi
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&
      sort=created:asc&client_id=${config.get('githubclientid')}&client_secret=
      ${config.get('githubclientsecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
