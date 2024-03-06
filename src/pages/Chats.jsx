import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { getChatsByUserHandle } from "../services/chat.services";
import { v4 } from "uuid";
import ChatMessages from "../components/ChatMessages";
import CreateChatPopUp from "../components/CreateChatPopUp";

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
    <>
      <div>
        {myChats ? (
          Object.keys(myChats).map((chatId) => {
            const chatName = Object.keys(myChats[chatId].participants).filter((participant) => participant !== userData.handle).join(", ");
            return (
              <h1 key={v4()} onClick={() => navigate(`/chats/${chatId}`)}>
                {chatName}
              </h1>
            );
          })
        ) : (
          <h1>You dont have any chats yet...</h1>
        )}
        {<CreateChatPopUp/>}
      </div>
      {chatId && <ChatMessages/>}
    </>
  );
};

export default Chats;


