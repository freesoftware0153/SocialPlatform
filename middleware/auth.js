// initialize a middleware which will authenticate token sent by client
// and our route are authenticated first and protected when req sent to server
// to do that we create our own custom middleware
const jwt = require('jsonwebtoken');
const config = require('config');

//invoking our own middleware fn which has req,res object and next is call back
//once we complete it so that it can move to other middleware
module.exports = function (req, res, next) {
  //when we send req to protected route we need to send the header
  //inside token in it
  //get token from header
  const token = req.header('x-auth-token'); //that the header key we wanna send along inside token in

  //if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token,authentication failed' });
  }
  //if there is token verify it
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    // decoded object's user assigned to req.user,now we can use this req.user
    //in any of our protected routes for instance we can get user profile
    req.user = decoded.user; // take req object and assign the value to user
    next();
  } catch (err) {
    res.status(401).json({ msg: 'token is invalid' });
  }
};
//module.exports = fn;
