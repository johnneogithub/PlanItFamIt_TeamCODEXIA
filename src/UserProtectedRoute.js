// UserProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from './AuthContext';

const UserProtectedRoute = ({ component: Component, ...rest }) => {
  const { currentUser, isAdmin } = useAuth(); // Get both currentUser and isAdmin

  console.log("Current User in UserProtectedRoute:", currentUser); // Debugging log
  console.log("Is Admin in UserProtectedRoute:", isAdmin); // Debugging log

  return (
    <Route
      {...rest}
      render={(props) =>
        currentUser ? <Component {...props} isAdmin={isAdmin} /> : <Redirect to="/Login" />
      }
    />
  );
};

export default UserProtectedRoute;
