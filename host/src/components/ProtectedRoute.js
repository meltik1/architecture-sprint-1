import { Navigate, Route } from "react-router-dom";

const ProtectedRoute = ({ component: Component, loggedIn, ...props }) => {
  return loggedIn ? <Component {...props} /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;