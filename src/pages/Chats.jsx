import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { getChatsByUserHandle } from "../services/chat.services";
import { v4 } from "uuid";
import ChatMessages from "../components/ChatMessages";
import CreateChatPopUp from "../components/CreateChatPopUp";
import { Grid, GridItem, Heading } from "@chakra-ui/react";

const Chats = () => {
  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);

  useEffect(() => {
    getChatsByUserHandle(userData.handle).then((chats) => {
      if (chats) {
        setMyChats(chats);
      }
    });
  }, [chatId]);

  return (
    <Grid templateColumns="repeat(6, 1fr)">
      <GridItem h='87vh' as='aside' border='2px solid green' colSpan={1}>
        {<CreateChatPopUp />}
        {myChats ? (
          Object.keys(myChats).map((chatId) => {
            const chatName = Object.keys(myChats[chatId].participants).filter((participant) => participant !== userData.handle).join(", ");
            return (
              <Heading size='md' cursor='pointer' key={v4()} onClick={() => navigate(`/chats/${chatId}`)}>
                {chatName}
              </Heading>
            );
          })
        ) : (
          <Heading fontSize='2em'>You dont have any chats yet...</Heading>
        )}
      </GridItem>

      {chatId &&
        <GridItem h='87vh' colSpan={5} border='2px solid green'>
          <ChatMessages />
        </GridItem>
      }
    </Grid>
  );
};

export default Chats;


