import PropTypes from "prop-types";
import { useContext, useState } from "react";
import AppContext from "../providers/AppContext";
import { useNavigate } from "react-router-dom";
import { createUserHandle, getUserByHandle } from "../services/user.services";
import { registerUser } from "../services/auth.service";
import { Button, Container, Heading, Input, useToast } from "@chakra-ui/react";

const SignUp = () => {
  const toast = useToast();

  const { setContext } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    handle: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const showToast = (desc, status) => {
    toast({
      title: "Registration",
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

  const register = async () => {
    if (form.firstName.length < 4 || form.firstName.length > 32) {
      showToast("First name must be between 4 and 32 symbols!", "error");
      return;
    }

    if (form.lastName.length < 4 || form.lastName.length > 32) {
      showToast("Last name must be between 4 and 32 symbols!", "error");
      return;
    }

    const user = await getUserByHandle(form.handle);
    if (user.exists()) {
      showToast(`Handle @${form.handle} already exists`, "error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const credentials = await registerUser(form.email, form.password);
      await createUserHandle(
        form.handle,
        credentials.user.uid,
        form.firstName,
        form.lastName,
        form.email
      );

      setContext({ user, userData: null });
      navigate("/");
    } catch (error) {
      showToast("Invalid email or password", "error");
    }

    showToast("User registered successfully", "success");
  };

  return (
    <Container>
      <Heading>Sign up</Heading>
      <Input
        placeholder="username"
        value={form.handle}
        onChange={updateForm("handle")}
      />
      <Input
        placeholder="First name"
        value={form.firstName}
        onChange={updateForm("firstName")}
      />

      <Input
        placeholder="Last name"
        value={form.lastName}
        onChange={updateForm("lastName")}
      />
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
      <Input
        type="password"
        placeholder="Confirm password"
        value={form.confirmPassword}
        onChange={updateForm("confirmPassword")}
      />
      <Button onClick={register}>Sign up</Button>
      <Button onClick={() => navigate(-1)}>Cancel</Button>
    </Container>
  );
};

SignUp.propTypes = {};

export default SignUp;
