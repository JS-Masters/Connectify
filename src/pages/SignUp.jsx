// import PropTypes from "prop-types";
import { useContext } from "react";
import AppContext from "../providers/AppContext";
import { Form, useNavigate } from "react-router-dom";
import { createUserHandle, getUserByHandle } from "../services/user.services";
import { registerUser } from "../services/auth.service";
import {
  Button,
  HStack,
  Heading,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";

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
      position: "top"
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
        email
      );

      setContext({ user, userData: null });
      navigate("/");
    } catch (error) {
      showToast("Invalid email or password", "error");
    }

    showToast("User registered successfully", "success");
  };

  return (
    <Form
      onSubmit={handleSubmit}
      style={{ width: "380px", margin: "auto", marginTop: "150px" }}
    >
      <VStack spacing="10px">
        <Heading>Sign up</Heading>
        <Input placeholder="username" name="username" />
        <Input placeholder="First name" name="firstName" />
        <Input placeholder="Last name" name="lastName" />
        <Input type="email" placeholder="Email" name="email" />
        <Input type="password" placeholder="Password" name="password" />
        <Input
          type="password"
          placeholder="Confirm password"
          name="confirmPassword"
        />
        <HStack spacing="20px">
          <Button type="submit">Sign up</Button>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
        </HStack>
      </VStack>
    </Form>
  );
};

// SignUp.propTypes = {};

export default SignUp;
