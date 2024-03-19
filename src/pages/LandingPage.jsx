import {
  Box,
  Button,
  HStack,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { fetchAllUsers } from "../services/user.services";
import CountUp from "react-countup";

const LandingPage = () => {
  const { user } = useContext(AppContext);
  const [users, setUsers] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    user ? navigate("/") : null;
  }, [user, navigate]);

  useEffect(() => {
    fetchAllUsers().then((users) => setUsers(users));
  }, [users]);

  const userCount = users ? Object.keys(users).length : 0;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="100%"
      pos="relative"
    >
      <Heading as="h4" pos="absolute" top="0" right="0" color="red">
        {" "}
        <CountUp duration={10} end={userCount} /> users are already using
        Connectify.
      </Heading>
      <VStack w="380px" color="goldenrod" textAlign='center'>
        <Heading>Welcome to Connectify</Heading>

        <Text mb='10px'>
          Here, you&apos;ll find everything you need to stay connected with your
          friends and loved ones.
          <br />
          From talk about everything to planning hangouts, our platform makes
          communication easy and fun.
          <br />
          Dive into conversations, express yourself with a wide range of emojis
          and GIFs, and enjoy the experience of staying in touch with those who
          matter most.
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
