import { useContext, useEffect, useState } from "react";
import { REACTIONS } from "../common/constants";
import {
  getReactionsByMessage,
  addReactionToMessage,
  removeReactionFromMessage,
  getReactionsByReply,
  addReactionToReply,
  removeReactionFromReply,
} from "../services/chat.services";
import PropTypes from "prop-types";
import { AddIcon } from "@chakra-ui/icons";


import { useDisclosure } from "@chakra-ui/react";
import PickerModal from "./PickerModal";
import { v4 } from "uuid";
import AppContext from "../providers/AppContext";
import { useParams } from "react-router-dom";

const Reactions = ({  messageId, replyID = null }) => {

  const { userData } = useContext(AppContext);
  const {chatId} = useParams();
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
    <div>
      {replyID ? (
        <div>
          {REACTIONS.map((reaction) => (
            <span key={v4()} onClick={() => handleReplyReaction(reaction)}>
              {replyReactions && replyReactions[userData.handle] === reaction ? (
                <span style={{ border: "1px solid blue" }}>
                  {reaction}{" "}
                </span>
              ) : (
                <span>{reaction} </span>
              )}
            </span>
          ))}
          < AddIcon onClick={onOpen} />
        </div>
      ) : (
        <div>
          {REACTIONS.map((reaction) => (
            <span key={v4()} onClick={() => handleMessageReaction(reaction)}>
              {messageReactions && messageReactions[userData.handle] === reaction ? (
                <span style={{ border: "1px solid blue" }}>
                  {reaction}{" "}
                </span>
              ) : (
                <span>{reaction} </span>
              )}
            </span>
          ))}
          <AddIcon onClick={onOpen} />
        </div>
      )}
      <PickerModal isOpen={isOpen} handleReaction={replyID ? handleReplyReaction : handleMessageReaction} onClose={onClose} />
    </div>
  );
};

Reactions.propTypes = {
  chatId: PropTypes.string.isRequired,
  messageId: PropTypes.string.isRequired,

  replyID: PropTypes.string,
};

export default Reactions;