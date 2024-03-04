import { Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../providers/AppContext";

const LandingPage = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    user ? navigate("/") : null;
  }, [user, navigate]);

  return (
    <VStack w="380px" m="auto" mt="200px">
      <Heading>Welcome to Connectify</Heading>
      <Text>
        Connectify is a platform that allows you to connect with your friends
        and family.
      </Text>

      <HStack>
        <Button onClick={() => navigate("/sign-in")}>Sign in</Button>
        <Button onClick={() => navigate("/sign-up")}>Sign up</Button>
      </HStack>
    </VStack>
  );
};

export default LandingPage;
