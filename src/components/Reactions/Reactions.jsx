import PropTypes from "prop-types";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../../providers/AppContext";
import {
  getReactionsByMessage,
  addReactionToMessage,
  removeReactionFromMessage,
  getReactionsByReply,
  addReactionToReply,
  removeReactionFromReply,
} from "../../services/chat.services";
import { Box } from "@chakra-ui/react";
import { FaRegSmile } from "react-icons/fa";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import "./Reactions.css";

const Reactions = ({ messageId, replyID = null }) => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [messageReactions, setMessageReactions] = useState({});
  const [replyReactions, setReplyReactions] = useState({});
  const [pickerIsVisible, setPickerIsVisible] = useState(false);
  const [pickerPositon, setPickerPosition] = useState({});
  const parentRef = useRef(null);

  useEffect(() => {
    const parentElement = parentRef.current;

    if (parentElement) {
      const parentRect = parentElement.getBoundingClientRect();
      const pickerHeight = 440;
      const spaceTop = parentRect.top;
      const spaceBottom = window.innerHeight - parentRect.bottom;

      let left = -250;
      let top;
      if (spaceBottom >= pickerHeight) {
        top = 35;
      } else if (spaceTop >= pickerHeight) {
        top = -pickerHeight;
      } else {
        top = pickerHeight / -2;
        left = -355;
      }
      setPickerPosition({ left, top });
    }
  }, []);

  useEffect(() => {
    const unsubscribeMessageReactions = getReactionsByMessage(
      chatId,
      messageId,
      (snapshot) => {
        setMessageReactions(snapshot.val());
      }
    );

    const unsubscribeReplyReactions =
      replyID &&
      getReactionsByReply(chatId, messageId, replyID, (snapshot) => {
        setReplyReactions(snapshot.val());
      });

    return () => {
      unsubscribeMessageReactions();
      unsubscribeReplyReactions && unsubscribeReplyReactions();
    };
  }, [chatId, messageId, replyID]);

  const handleMessageReaction = async (reaction) => {
    if (messageReactions && messageReactions[userData.handle] === reaction) {
      await removeReactionFromMessage(chatId, messageId, userData.handle);
    } else {
      await addReactionToMessage(chatId, messageId, reaction, userData.handle);
    }
  };

  const handleReplyReaction = async (reaction) => {
    if (replyReactions && replyReactions[userData.handle] === reaction) {
      await removeReactionFromReply(
        chatId,
        messageId,
        replyID,
        userData.handle
      );
    } else {
      await addReactionToReply(
        chatId,
        messageId,
        replyID,
        reaction,
        userData.handle
      );
    }
  };

  return (
    <Box ref={parentRef} position="relative">
      <FaRegSmile
        onClick={() => setPickerIsVisible(!pickerIsVisible)}
        id="smile-icon"
        style={{ fontSize: "30px", cursor: "pointer"}}
      />
      <Box
        pos="absolute"
        left={pickerPositon.left}
        top={pickerPositon.top}
        zIndex="10"
        display={pickerIsVisible ? "block" : "none"}
      >
        <Picker
          data={data}
          previewPosition="none"
          onEmojiSelect={(e) => {
            replyID
              ? handleReplyReaction(e.native)
              : handleMessageReaction(e.native);
            setPickerIsVisible(false);
          }}
        />
      </Box>
    </Box>
  );
};

Reactions.propTypes = {
  messageId: PropTypes.string.isRequired,
  replyID: PropTypes.string,
};

export default Reactions;
