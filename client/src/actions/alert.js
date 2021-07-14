// these set alert and remove alert we will dispartch these which will call
// case inside our reducer
// redux-thunk -- async action createors
import { SET_ALERT, REMOVE_ALERT } from './types';
import uuid from 'uuid/v4';

//we have an action setAlert which will dispatch the type set alert to reducer
//and then it will add the alert to the state which is empty initially
export const setAlert =
  (msg, alertType, timeout = 3000) =>
  (dispatch) => {
    const id = uuid();
    dispatch({
      type: SET_ALERT,
      payload: { msg, alertType, id },
    });
    setTimeout(() => {
      dispatch({ type: REMOVE_ALERT, payload: id });
    }, timeout);
  };
