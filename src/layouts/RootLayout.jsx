import NavBar from "../components/NavBar";
import { Grid, GridItem } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <Grid templateColumns="repeat(6, 1fr)" bg="gray.50">
      <GridItem as="main" colSpan={6} padding="0px">
        <NavBar />
        <Outlet />
      </GridItem>
    </Grid>
  );
};

export default RootLayout;
