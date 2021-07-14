const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//POST api/users
//Private
router.post(
  '/',
  [auth, [check('text', 'text is required').notEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        //we got id of user from token using that got name from db
        text: req.body.text, // it is gonna come from body
        user: req.user.id, //it is gonna come from body
        name: user.name /* it is gonna come from db*/,
        avatar: user.avatar /* it is gonna come from db*/,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

/* route  Get api/posts
   desc   get post of all users
   access private*/
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/* route  Get api/posts/:id
   desc   get post of a user by id
   access private*/
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(400).json({ msg: 'no post' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(400).json({ msg: 'no post' });
    }
    res.status(500).send('Server Error');
  }
});

/* route  Delete api/posts/:id
   desc   delete post of a user by id
   access private*/
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(400).json({ msg: 'no post' });
    }
    //check user who is deleting post if he is equal to logged in user
    if (post.user.toString() != req.user.id) {
      res.status(400).json({ msg: 'U cannot delete post' });
    }
    await post.remove();

    res.json({ msg: 'post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(400).json({ msg: 'no post' });
    }
    res.status(500).send('Server Error');
  }
});

/* route  PUT api/posts/like/:id
   desc   liking a post of user by id
   access private*/
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/* route  PUT api/posts/unlike/:id
   desc   unliking a post of user by id
   access private*/
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post is not liked yet' });
    }
    //remove user from likes array by req.user.id
    const index = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(index, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/* route  POST api/posts/comments/:id
   desc   commenting a post of user by id
   access private*/
router.post(
  '/comments/:id',
  [auth, [check('text', 'text is required').notEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        //we got id of user from token using that got name from db
        text: req.body.text, // it is gonna come from body
        user: req.user.id, //it is gonna come from body
        name: user.name /* it is gonna come from db*/,
        avatar: user.avatar /* it is gonna come from db*/,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

/* route  DELETE api/posts/comments/:id/:comments_id
   desc   deleting a comment of user by id
   access private*/

router.delete('/comments/:id/:comments_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comments_id
    );

    if (!comment) {
      return res.status(404).json({ msg: 'comment not found' });
    }
    //check for user
    if (comment.user.toString() != req.user.id) {
      return res
        .status(401)
        .json({ msg: 'U cannot delete post not authorized' });
    }

    //remove user from comments array by req.user.id
    const index = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(index, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
