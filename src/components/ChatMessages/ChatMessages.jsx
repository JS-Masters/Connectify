import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams } from "react-router";
import { getChatMessagesById as listenForChatMessages } from "../../services/chat.services";
import ChatMessageBox from "../ChatMessageBox/ChatMessageBox";
import ChatInput from "../ChatInput/ChatInput";
import { Box } from "@chakra-ui/react";
import { v4 } from "uuid";
import "./ChatMessages.css";

const ChatMessages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [dontScroll, setDontScroll] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = listenForChatMessages((snapshot) => {
      const msgData = snapshot.exists() ? snapshot.val() : {};
      const newMessages = Object.values(msgData);

      setMessages((prevMessages) => {
        const wasMessagesLengthSame =
          prevMessages.length === Object.keys(newMessages).length;
        setDontScroll(wasMessagesLengthSame);
        return newMessages;
      });
    }, chatId);
    return () => unsubscribe();
  }, [chatId]);

  useLayoutEffect(() => {
    if (!dontScroll) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  const isMessageFromSameAuthor = (message) => {
    const messageIndex = messages.indexOf(message);
    if (messageIndex !== 0) {
      const oldMessage = messages[messageIndex - 1];
      return oldMessage.author === message.author;
    }
    return false;
  };

  return (
    <>
      <Box
        id="chat-messages-box"
        position="relative"
        overflow="hidden"
        overflowY="auto"
        whiteSpace="nowrap"
        h="88%"
        w="83%"
      >
        {messages &&
          messages.map((message) =>
            isMessageFromSameAuthor(message) ? (
              <ChatMessageBox key={v4()} message={message} sameAuthor={true} />
            ) : (
              <ChatMessageBox key={v4()} message={message} sameAuthor={false} />
            )
          )}

        <div ref={messagesEndRef} />
      </Box>
      <ChatInput />
    </>
  );
};

export default ChatMessages;
