//route reducer -- which is function and takes state and action and returns new state
import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post';

export default combineReducers({ alert, auth, profile, post });
