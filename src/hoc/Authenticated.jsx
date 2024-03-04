import PropTypes from "prop-types";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { Navigate, useLocation } from "react-router-dom";

const Authenticated = ({ children }) => {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (user === null) {
    return (
      <Navigate to="/welcome" path={location.pathname}>
        {" "}
      </Navigate>
    );
  }

  return children;
};

Authenticated.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Authenticated;
