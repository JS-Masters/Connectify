import { useEffect, useState } from "react";
import { REACTIONS } from "../common/constants";
import { addReactionToMessage, removeReactionFromMessage, getReactionsByMessage } from "../services/chat.services";

const Reactions = ({ chatId, messageId, userHandle }) => {
    const [reactions, setReactions] = useState({});

    useEffect(() => {
        const unsubscribe = getReactionsByMessage(chatId, messageId, (snapshot) => {
          setReactions(snapshot.val());
        });
      
        return () => unsubscribe(); 
      }, [chatId, messageId]);

    const handleReaction = async (reaction) => {
        if (reactions && reactions[userHandle] === reaction) {
            await removeReactionFromMessage(chatId, messageId, userHandle);
        } else {
            await addReactionToMessage(chatId, messageId, reaction, userHandle);
        
        }
    };
    
    return (
        <div>
        {Object.keys(REACTIONS).map((reaction) => (
            <span key={reaction} onClick={() => handleReaction(reaction)}>
            {REACTIONS[reaction]} {reactions && reactions[userHandle] === reaction ? 1 : 0}
            </span>
        ))}
        </div>
    );
};

export default Reactions;