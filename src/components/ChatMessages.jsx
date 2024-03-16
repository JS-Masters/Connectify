import { useContext, useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams } from "react-router";
import { editMessageInChat, getChatMessagesById as listenForChatMessages, deleteMessageFromChat, replyToMessage, editReplyInChat, deleteReplyFromChat, leaveChat, addMessageToChat } from "../services/chat.services";
import ChatMessageBox from "./ChatMessageBox";
import ChatInput from "./ChatInput";
import AppContext from "../providers/AppContext";
import { Box, Button } from "@chakra-ui/react";
import { SYSTEM_AVATAR } from "../common/constants";

const ChatMessages = () => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [emojiWasClicked, setEmojiWasClicked] = useState(false);
  const messagesEndRef = useRef(null);



  useEffect(() => {
    const unsubscribe = listenForChatMessages((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      const newMessages = Object.values(msgData);
      // filter дали е от емотикона => ако не е преди setMessages сменяме стейт

      // console.log(messages);
      // console.log(newMessages);
      // const checkIfEmoji = newMessages.filter((m) => {
      //   // console.log(messages.find((msg) => msg.id === m.id));
      //   // console.log(m);
      // //   if(!('reactions' in m)) {
      // //     return false;
      // //   } else if(('reactions' in m) && (!'reactions' in messages.find((msg) => msg.id === m.id))) {
      // //     setEmojiWasClicked(true);
      // //     setMessages(newMessages);
      // //   }
      // });
      setMessages(newMessages);

    }, chatId);
    return () => unsubscribe();
  }, [chatId]);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }
  // , [messages]);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 0);
    return () => clearTimeout(timeout);
  }, [messages]);


  const handleEditMessage = async (messageId, newContent) => {
    try {

      // throw new Error ('FATAL ERROR :)')
      await editMessageInChat(chatId, messageId, newContent);
    } catch (error) {
      // showToast(error);
      // setError(error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    await deleteMessageFromChat(chatId, messageId, userData.handle);
  };


  const handleReplyToMessage = async (messageId, replyContent) => {
    await replyToMessage(chatId, messageId, replyContent, userData.handle);
  };

  const handleEditReply = async (messageId, replyId, newContent) => {
    await editReplyInChat(chatId, messageId, replyId, newContent
    );
  };

  const handleDeleteReply = async (messageId, replyId) => {
    await deleteReplyFromChat(chatId, messageId, replyId, userData.handle);
  }

  return (
    <Box overflowY='scroll' whiteSpace='nowrap' h='88%'>
      {messages && (
        messages.map((message) => (
          <ChatMessageBox
            key={message.id}
            message={message}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onReply={handleReplyToMessage}
            onEditReply={handleEditReply}
            onDeleteReply={handleDeleteReply}
          // chatId={chatId}
          // reactions={message.reactions}
          />
        ))
      )}
      <ChatInput />
      <div ref={messagesEndRef} />
    </Box>

  );

};

export default ChatMessages;




