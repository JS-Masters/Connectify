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
      duration: 3000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userName = event.target.elements.username.value;
    const email = event.target.elements.email.value;
    const pass = event.target.elements.password.value;
    const confirmPassword = event.target.elements.confirmPassword.value;
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
        email,
        statuses.online,
        statuses.online
      );
      setContext({ user, userData: null });
      navigate("/chats");
    } catch (error) {
      showToast("Invalid email or password", "error");
    }
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
        <Heading fontSize='44px !important'>SIGN UP</Heading>
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
          <Box className="form-box" mt="0 !important">
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

export default SignUp;
