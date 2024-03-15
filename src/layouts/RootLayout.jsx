import NavBar from "../components/NavBar/NavBar";
import { Grid, GridItem } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div style={{backgroundColor:'black'}}>

        <NavBar />

        <Outlet />
 </div>
  );
};

export default RootLayout;


{/* <Grid templateColumns="repeat(6, 1fr)" bg="gray.50" backgroundColor='black'>
<GridItem
  as="nav"
  colSpan={6}
  // display="flex"
  // alignItems="center"
  // justifyContent="space-around"
  // flexWrap="wrap"
  p="1.5rem"
  bg="brand.500"
  color="white"
>
  <NavBar />
</GridItem>
<GridItem as="main" colSpan={6} height='90vh' backgroundColor='gray'>
  <Outlet />
</GridItem>
</Grid> */}
