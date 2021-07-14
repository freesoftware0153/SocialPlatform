// its is a function if there is token it is gonna put it to the header
// if not then deletes from header by setting global header using axios
import axios from 'axios';

// reason we r doing this is if we have toekn we r gonna send the token with
//every request instead of pcking and chosing which req to send it with
const setAuthToken = (token) => {
  if (token) {
    //setting global header using axios
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};
export default setAuthToken;
