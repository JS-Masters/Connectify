import { Box } from "@chakra-ui/react";
import NavBar from "../components//NavBar";
import { Outlet } from "react-router-dom";


const RootLayout = () => {
  return (
    <>
      <NavBar />
      <Box bgImage={`url(${'../../public/background.jpg'})`} h="89vh" w='1500px' m='auto'>
        <Outlet />
      </Box>
    </>
  );
};

export default RootLayout;

