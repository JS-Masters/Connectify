import { useParams } from "react-router-dom";
import ChatMessages from "../components/ChatMessages";
import { Grid, GridItem } from "@chakra-ui/react";
import ChatList from "../components/ChatList";

const Chats = () => {

  const { chatId } = useParams();

  return (
    <Grid templateColumns="repeat(4, 1fr)">
      <GridItem h='87vh'w='25vh' as='aside' border='2px solid orange' colSpan={1}>
        <ChatList />
      </GridItem>
      {chatId &&
        <GridItem h='87vh' colSpan={3} border='2px solid green'>
          <ChatMessages />
        </GridItem>
      }
    </Grid>
  );
};

export default Chats;


