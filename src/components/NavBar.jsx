import { Box, Flex, Heading } from "@chakra-ui/react";
import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { useContext } from "react";
import AppContext from "../providers/AppContext";

const NavBar = () => {
  const { userData, setContext } = useContext(AppContext);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-around"
      wrap="wrap"
      padding="1.5rem"
      bg="brand.500"
      color="white"
    >
      <Box>
        <Heading>C</Heading>
      </Box>
      <Box>
        <Heading>Welcome to Connectify</Heading>
      </Box>
      {userData && (
        <Dropdown
          username={userData.handle}
          avatarUrl={userData.avatarUrl}
          setContext={setContext}
        />
      )}
    </Flex>
  );
};

NavBar.propTypes = {};

export default NavBar;
