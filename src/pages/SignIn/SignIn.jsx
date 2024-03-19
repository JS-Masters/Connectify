// import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import AppContext from "../../providers/AppContext";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";

import {
  Box,
  Heading,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { UnlockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import "./SignIn.css";

const SignIn = () => {
  const toast = useToast();
  const { user, setContext } = useContext(AppContext);

  const [show, setShow] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate(location.state?.from.pathname || "/");
    }
  }, [user, location.state?.from.pathname, navigate]);

  const toggleShow = () => setShow(!show);

  const showToast = (desc, status) => {
    toast({
      title: "Login",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
      icon: <UnlockIcon />,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.elements.email.value;
    const pass = event.target.elements.password.value;

    try {
      const credentials = await loginUser(email, pass);
      setContext({ user: credentials.user, userData: null });
    } catch (error) {
      showToast("Invalid email or password", "error");
      return;
    }

    showToast("Successfully logged in", "success");
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="100%"
      fontFamily="Poppins"
    >
      <Form
        className="form"
        onSubmit={handleSubmit}
        style={{ width: "350px", color: "goldenrod" }}
      >
        <Heading>Log in</Heading>
        <Box className="form-content">
          <Box className="form-box">
            <label>Username</label>
            <input type="email" name="email" placeholder="email.com" />
          </Box>
          <Box className="form-box">
            <label>Password</label>
            <InputGroup>
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="••••••••"
              />
              <InputRightElement mt="4px">
                {show ? (
                  <ViewOffIcon cursor="pointer" onClick={toggleShow} />
                ) : (
                  <ViewIcon cursor="pointer" onClick={toggleShow} />
                )}
              </InputRightElement>
            </InputGroup>
          </Box>
          <Box className="form-box">
            <input type="submit" value="Sign In" />
          </Box>
        </Box>
      </Form>
    </Box>
  );
};

// SignIn.propTypes = {};

export default SignIn;
