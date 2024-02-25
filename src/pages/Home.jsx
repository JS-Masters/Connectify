import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
import AppContext from "../providers/AppContext";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  return <div>Home</div>;
};

Home.propTypes = {};

export default Home;
