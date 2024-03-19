// import PropTypes from "prop-types";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { Form, useNavigate } from "react-router-dom";
import { createUserHandle, getUserByHandle } from "../services/user.services";
import { registerUser } from "../services/auth.service";
import { Box, Heading, useToast } from "@chakra-ui/react";
import { statuses } from "../common/constants";

const SignUp = () => {
  const toast = useToast();
  const { setContext } = useContext(AppContext);
  const navigate = useNavigate();

  const showToast = (desc, status) => {
    toast({
      title: "Registration",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userName = event.target.elements.username.value;
    const firstName = event.target.elements.firstName.value;
    const lastName = event.target.elements.lastName.value;
    const email = event.target.elements.email.value;
    const pass = event.target.elements.password.value;
    const confirmPassword = event.target.elements.confirmPassword.value;

    if (firstName.length < 4 || firstName.length > 32) {
      showToast("First name must be between 4 and 32 symbols!", "error");
      return;
    }

    if (lastName.length < 4 || lastName.length > 32) {
      showToast("Last name must be between 4 and 32 symbols!", "error");
      return;
    }

    const user = await getUserByHandle(userName);
    if (user.exists()) {
      showToast(`Handle @${userName} already exists`, "error");
      return;
    }

    if (pass !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const credentials = await registerUser(email, pass);
      await createUserHandle(
        userName,
        credentials.user.uid,
        firstName,
        lastName,
        email,
        statuses.online,
        statuses.online
      );

      setContext({ user, userData: null });
      navigate("/");
    } catch (error) {
      showToast("Invalid email or password", "error");
    }

    showToast("User registered successfully", "success");
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="100%"
      fontFamily="Oswald"
    >
      <Form
        className="form"
        onSubmit={handleSubmit}
        style={{ width: "350px", color: "goldenrod" }}
      >
        <Heading>Sign up</Heading>
        <Box className="form-content">
          <Box className="form-box">
            <input placeholder="username" name="username" />
          </Box>
          <Box className="form-box">
            <input type="email" placeholder="Email" name="email" />
          </Box>
          <Box className="form-box">
            <input type="password" placeholder="Password" name="password" />
          </Box>
          <Box className="form-box">
            <input
              type="password"
              placeholder="Confirm password"
              name="confirmPassword"
            />
          </Box>
          <Box className="form-box">
            <input type="submit" value="Sign up" />
          </Box>
          <Box className="form-box" mt='0 !important'>
            <input
              type="button"
              value="Cancel"
              name="navigate"
              onClick={() => navigate(-1)}
            />
          </Box>
        </Box>
      </Form>
    </Box>
  );
};

// SignUp.propTypes = {};

export default SignUp;
