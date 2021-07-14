// this is our reducer which is gonna be our function which just take state
// and deals whth state of alert and is gonna take action from action file
// alerts look like objects
import { SET_ALERT, REMOVE_ALERT } from '../actions/types';
const initialState = []; // initially empty state

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload]; // return the payload with new alert
    case REMOVE_ALERT:
      //return all alerts except which matches the payload
      return state.filter((alert) => alert.id !== payload); //here for each alert checking for specific alert id which is payload
    default:
      return state;
  }
}
//type which we need to evaluate by switch statement
