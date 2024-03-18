import { Box, Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
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
    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
      <VStack w="380px" color="goldenrod">
        <Heading>Welcome to Connectify</Heading>
        <Text>
          Connectify is a platform that allows you to connect with your friends
          and family.
        </Text>

        <HStack>
          <Button colorScheme="green" onClick={() => navigate("/sign-in")}>
            Sign in
          </Button>
          <Button colorScheme="green" onClick={() => navigate("/sign-up")}>
            Sign up
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default LandingPage;
