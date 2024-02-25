import PropTypes from "prop-types";
import { useContext, useState, useEffect } from "react";
import AppContext from "../providers/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth.service";

import {
  Button,
  Container,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";

const SignIn = () => {
  const toast = useToast();
  const { user, setContext } = useContext(AppContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (desc, status) => {
    toast({
      title: "Login",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
      // icon: <UnlockIcon />,
    });
  };

  const updateForm = (prop) => (event) => {
    setForm({ ...form, [prop]: event.target.value });
  };

  useEffect(() => {
    if (user) {
      navigate(location.state?.from.pathname || "/");
    }
  }, [user, location.state?.from.pathname, navigate]);

  const login = async () => {
    try {
      const credentials = await loginUser(form.email, form.password);
      setContext({ user: credentials.user, userData: null });
    } catch (error) {
      showToast("Invalid email or password", "error");
    }

    showToast("Successfully logged in", "success");
  };

  return (
    <Container>
      <Heading>Welcome</Heading>
      <Input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={updateForm("email")}
      />
      <Input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={updateForm("password")}
      />
      <Button onClick={login}>Sign In</Button>
      <Button onClick={() => navigate("/sign-up")}>Register</Button>
    </Container>
  );
};

SignIn.propTypes = {};

export default SignIn;
