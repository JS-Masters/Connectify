import { useContext, useEffect, useState } from "react";
// import { REACTIONS } from "../common/constants";
import {
  getReactionsByMessage,
  addReactionToMessage,
  removeReactionFromMessage,
  getReactionsByReply,
  addReactionToReply,
  removeReactionFromReply,
} from "../services/chat.services";
import PropTypes from "prop-types";
import { FaRegSmile } from "react-icons/fa";


import { useDisclosure } from "@chakra-ui/react";
import PickerModal from "./PickerModal";

import AppContext from "../providers/AppContext";
import { useParams } from "react-router-dom";

const Reactions = ({ messageId, replyID = null }) => {

  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [messageReactions, setMessageReactions] = useState({});
  const [replyReactions, setReplyReactions] = useState({});

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const unsubscribeMessageReactions = getReactionsByMessage(
      chatId,
      messageId,
      (snapshot) => {
        setMessageReactions(snapshot.val());
      }
    );

    const unsubscribeReplyReactions = replyID &&
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
      await removeReactionFromReply(chatId, messageId, replyID, userData.handle);
    } else {
      await addReactionToReply(chatId, messageId, replyID, reaction, userData.handle);
    }
  };


  return (
    <>
      <FaRegSmile onClick={onOpen} style={{ fontSize: '30px', cursor: 'pointer' }} />
      <PickerModal isOpen={isOpen} handleReaction={replyID ? handleReplyReaction : handleMessageReaction} onClose={onClose} />
    </>
  );
};

Reactions.propTypes = {
  chatId: PropTypes.string.isRequired,
  messageId: PropTypes.string.isRequired,

  replyID: PropTypes.string,
};

export default Reactions;