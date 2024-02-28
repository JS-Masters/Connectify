import NavBar from "../components/NavBar";
import { Grid, GridItem } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <Grid templateColumns="repeat(6, 1fr)" bg="gray.50" h="100vh">
      <GridItem as="main" colSpan={6}>
        <NavBar />
        <Outlet />
      </GridItem>
    </Grid>
  );
};

export default RootLayout;
