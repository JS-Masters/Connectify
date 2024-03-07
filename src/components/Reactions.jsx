import { useEffect, useState } from "react";
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

const Reactions = ({ chatId, messageId, userHandle, replyID }) => {
    const [messageReactions, setMessageReactions] = useState({});
  const [replyReactions, setReplyReactions] = useState({});

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
    if (messageReactions && messageReactions[userHandle] === reaction) {
      await removeReactionFromMessage(chatId, messageId, userHandle);
    } else {
      await addReactionToMessage(chatId, messageId, reaction, userHandle);
    }
  };

  const handleReplyReaction = async (reaction) => {
    if (replyReactions && replyReactions[userHandle] === reaction) {
      await removeReactionFromReply(chatId, messageId, replyID, userHandle);
    } else {
      await addReactionToReply(chatId, messageId, replyID, reaction, userHandle);
    }
  };
  return (
    <div>
      {replyID ? (
        <div>
          {Object.keys(REACTIONS).map((reaction) => (
            <span key={reaction} onClick={() => handleReplyReaction(reaction)}>
              {replyReactions && replyReactions[userHandle] === reaction ? (
                <span style={{ border: "1px solid blue" }}>
                  {REACTIONS[reaction]}{" "}
                </span>
              ) : (
                <span>{REACTIONS[reaction]} </span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <div>
          {Object.keys(REACTIONS).map((reaction) => (
            <span key={reaction} onClick={() => handleMessageReaction(reaction)}>
              {messageReactions && messageReactions[userHandle] === reaction ? (
                <span style={{ border: "1px solid blue" }}>
                  {REACTIONS[reaction]}{" "}
                </span>
              ) : (
                <span>{REACTIONS[reaction]} </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

Reactions.propTypes = {
    chatId: PropTypes.string.isRequired,
    messageId: PropTypes.string.isRequired,
    userHandle: PropTypes.string.isRequired,
    replyID: PropTypes.string,
    };

export default Reactions;