// import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import AppContext from "../providers/AppContext";
import { Form, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth.service";

import {
  Button,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { UnlockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

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
    <Form onSubmit={handleSubmit}>
      <Heading>Welcome</Heading>
      <Input type="email" placeholder="Email" name="email" />

      <InputGroup>
        <Input
          type={show ? "text" : "password"}
          placeholder="Password"
          name="password"
        />
        <InputRightElement>
          {show ? (
            <ViewOffIcon cursor="pointer" onClick={toggleShow} />
          ) : (
            <ViewIcon cursor="pointer" onClick={toggleShow} />
          )}
        </InputRightElement>
      </InputGroup>

      <Button type="submit">Sign In</Button>
      <Button onClick={() => navigate("/sign-up")}>Register</Button>
    </Form>
  );
};

// SignIn.propTypes = {};

export default SignIn;
