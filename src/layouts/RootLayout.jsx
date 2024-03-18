import { Box } from "@chakra-ui/react";
import NavBar from "../components/NavBar/NavBar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <NavBar />
      <Box
        bgImage={`url(${"/background.jpg"})`}
        h="89vh"
        maxW="1500px"
        m="auto"
      >
        <Outlet />
      </Box>
    </>
  );
};

export default RootLayout;
