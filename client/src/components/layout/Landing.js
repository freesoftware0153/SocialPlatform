import React from 'react';
import { Link, Redirect } from 'react-router-dom';
// in order to stay on our dashboard after logging in we need to have our state
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

export const Landing = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Redirect to='/dashboard' />;
  }
  return (
    <section className='landing'>
      <div className='dark-overlay'>
        <div className='landing-inner'>
          <h1 className='x-large'>Social Platform</h1>
          <p className='lead'>
            Create a profile/portfolio, share posts and get help from other
            people
          </p>
          <div className='buttons'>
            <Link to='/register' className='btn btn-primary'>
              Sign Up
            </Link>
            <Link to='/login' className='btn btn-primary'>
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

Landing.protoTypes = {
  isAuthenticated: PropTypes.bool,
};
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps)(Landing);
