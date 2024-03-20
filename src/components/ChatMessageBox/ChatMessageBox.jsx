import { useState, useContext } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Button,
  HStack,
  Heading,
  Image,
  Spacer,
  Text,
  Textarea,
} from "@chakra-ui/react";
import Reactions from "../Reactions/Reactions";
import {
  deleteMessageFromChat,
  editMessageInChat,
  removeReactionFromMessage,
  replyToMessage,
} from "../../services/chat.services";
import { v4 } from "uuid";
import AppContext from "../../providers/AppContext";
import FilePreview from "../FIlePreview";
import { useParams } from "react-router-dom";
import "./ChatMessageBox.css";
import { TICK } from "../../common/constants";

const ChatMessageBox = ({ message, sameAuthor }) => {
  const { userData } = useContext(AppContext);
  const { chatId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleEditButtonClick = () => {
    setIsEditing(true);
  };

  const handleSaveEditClick = () => {
    editMessageInChat(chatId, message.id, editedContent).then(() =>
      setIsEditing(false)
    );
  };

  const handleCancelEditClick = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDeleteButtonClick = () => {
    deleteMessageFromChat(chatId, message.id, userData.handle);
  };

  const handleHoverEnter = () => {
    setIsHovered(true);
  };

  const handleHoverLeave = () => {
    setIsHovered(false);
  };

  const handleReplyButtonClick = () => {
    setIsReplying(true);
  };

  const handleSaveReplyClick = () => {
    replyToMessage(
      chatId,
      message.id,
      replyContent,
      message.content,
      userData.handle,
      message.author,
      message.authorUrl
    ).then(() => {
      setIsReplying(false);
      setReplyContent("");
    });
  };

  const handleCancelReplyClick = () => {
    if (isReplying) {
      setIsReplying(false);
      setReplyContent("");
    } else {
      setEditedContent(message.content);
      setIsEditing(false);
    }
  };

  const countMessageReactions = (reactions = []) => {
    const reactionCount = reactions.reduce((acc, reaction) => {
      if (acc[reaction]) {
        acc[reaction]++;
      } else {
        acc[reaction] = 1;
      }
      return acc;
    }, {});
    return Object.entries(reactionCount);
  };

  return (
    <>
      <Box
        id="chat-message-box"
        onMouseEnter={handleHoverEnter}
        onMouseLeave={handleHoverLeave}
        mt={sameAuthor ? "0px" : "5px"}
        p="5px"
      >
        {"deleteMessage" in message ? (
          <Text
            style={{ color: "#a7555e", cursor: "default", fontSize: "15px" }}
          >
            <Text as='span' id="deleted-by-span"
              
                // color= "#a7555e"
                fontWeight= "bold"
                display= "inline"
              
            >
              {message.deleteMessage}{" "}
            </Text>
            by <Text as='span' id="deleted-by-username-span">{message.deletedBy} </Text>
            on {message.deletedOn}
          </Text>
        ) : (
          <>
            {!sameAuthor && (
              <>
                <Box
                  style={{
                    borderBottom: "1px solid black",
                    paddingBottom: "5px",
                  }}
                >
                  <HStack style={{ gap: "8px", height: "35px" }}>
                    <Avatar
                      src={message.authorUrl}
                      style={{
                        marginLeft: "5px",
                        width: "42px",
                        height: "42px",
                      }}
                    />
                    <Heading className="user-handle-chat-box" as="h3" size="sm">
                      {message.author}
                    </Heading>
                    <Spacer />
                    {userData.handle === message.author && isHovered && (
                      <>
                        <Image
                          id="edit-message-img"
                          onClick={handleEditButtonClick}
                          style={{
                            width: "42px",
                            height: "42px",
                            padding: "4px",
                          }}
                          src="../../../edit.png"
                        />
                        <Image
                          id="delete-message-img"
                          onClick={handleDeleteButtonClick}
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "4px",
                            marginRight: "10px",
                          }}
                          src="../../../delete.png"
                        />
                      </>
                    )}
                  </HStack>
                </Box>
              </>
            )}

            {isEditing ? (
              <Box position="relative">
                <Textarea
                  id="edit-textarea"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  style={{ marginTop: "30px" }}
                />{" "}
                <br />
                <Button
                  onClick={handleSaveEditClick}
                  cursor="pointer"
                  pos="absolute"
                  right="45px"
                  top="0px"
                  colorScheme="transperent"
                  color="green"
                  size="xs"
                  marginTop="2px"
                  padding="0px"
                  fontSize="25px"
                >
                  {TICK}
                </Button>
                <Button
                  onClick={handleCancelEditClick}
                  cursor="pointer"
                  pos="absolute"
                  right="0px"
                  top="0px"
                  colorScheme="transperent"
                  color="red"
                  size="sm"
                  fontSize="22px"
                // marginTop='2px'
                >
                  X
                </Button>
              </Box>
            ) : (
              <>
                <Box
                  padding="0"
                  pos="relative"
                  display="flex"
                  flexDirection="column"
                >
                  <Text
                    width="80%"
                    height="auto"
                    style={{
                      whiteSpace: "pre-wrap",
                      display: "inline-block",
                    }}
                  >
                    {"repliedMessageContent" in message &&
                      message.repliedMessageContent.length > 0 ? (
                      <>
                        <HStack marginTop="5px">
                          <Avatar
                            src={message.messageAuthorAvatar}
                            style={{
                              marginLeft: "10px",
                              width: "18px",
                              height: "18px",
                            }}
                          />
                          <Text
                            id="user-handle-chat-box-reply"
                            className="user-handle-chat-box"
                          >
                            {message.messageAuthor}
                          </Text>
                        </HStack>

                        <span
                          style={{
                            display: "block",
                            marginTop: "4px",
                            fontSize: "14px",
                          }}
                        >
                          {message.repliedMessageContent}
                        </span>
                        <span style={{ display: "block", marginBottom: "4px" }}>
                          <img
                            style={{
                              width: "25px",
                              height: "25px",
                              display: "inline",
                              marginRight: "4px",
                            }}
                            src="../../public/down-arrow.png"
                          />
                          {message.content}
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          style={{
                            display: "block",
                            marginBottom: "4px",
                            fontSize: "20px",
                          }}
                        >
                          {message.content}
                        </span>
                      </>
                    )}
                    <span
                      style={{
                        display: "block",
                        fontSize: "10px",
                        opacity: "0.3",
                      }}
                    >
                      {message.createdOn}
                    </span>
                    {message.editedOn && (
                      <Text
                        style={{
                          fontSize: "10px",
                          color: "bisque",
                          opacity: "0.6",
                        }}
                      >
                        {" "}
                        (edited) {message.editedOn}
                      </Text>
                    )}
                  </Text>
                  {userData.handle !== message.author &&
                    !isReplying &&
                    isHovered && (
                      <HStack pos="absolute" top="0" right="0">
                        <Reactions messageId={message.id} />
                        <Image
                          id="delete-message-img"
                          onClick={handleReplyButtonClick}
                          style={{
                            width: "42px",
                            height: "42px",
                            padding: "4px",
                            marginRight: "10px",
                          }}
                          src="../../../reply.png"
                        />
                      </HStack>
                    )}
                  {userData.handle === message.author &&
                    sameAuthor &&
                    isHovered && (
                      <HStack pos="absolute" top="0" right="0" spacing="7px">
                        <Image
                          id="edit-message-img"
                          onClick={handleEditButtonClick}
                          style={{
                            width: "45px",
                            height: "45px",
                            padding: "4px",
                            marginBottom: "7px",
                          }}
                          src="../../../edit.png"
                        />
                        <Image
                          id="delete-message-img"
                          onClick={handleDeleteButtonClick}
                          style={{
                            width: "37px",
                            height: "37px",
                            padding: "4px",
                            marginRight: "10px",
                            marginBottom: "7px",
                          }}
                          src="../../../delete.png"
                        />
                      </HStack>
                    )}
                  {message.img && <FilePreview fileUrl={message.img} />}
                  {"reactions" in message &&
                    <HStack>
                      {countMessageReactions(Object.values(message.reactions)).map(
                        (entry) =>
                          message.reactions[userData.handle] === entry[0] ? (
                            <span
                              id="user-reacted-emoji"
                              style={{
                                cursor: "pointer",
                                borderRadius: "5px",
                                width: "fit-content",
                              }}
                              key={v4()}
                              onClick={() =>
                                removeReactionFromMessage(
                                  chatId,
                                  message.id,
                                  userData.handle
                                )
                              }
                            >
                              {" "}
                              {entry[0]} {entry[1]}
                            </span>
                          ) : (
                            <span style={{ width: "fit-content" }} key={v4()}>
                              {" "}
                              {entry[0]} {entry[1]}
                            </span>
                          )
                      )}
                    </HStack>
                  }

                  {isReplying && (
                    <Box>
                      <Textarea
                        id="reply-textarea"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        style={{ marginTop: "30px" }}
                      />{" "}
                      <br />
                      <Button
                        onClick={handleSaveReplyClick}
                        cursor="pointer"
                        pos="absolute"
                        right="45px"
                        top="0px"
                        colorScheme="transperent"
                        color="green"
                        size="xs"
                        marginTop="46px"
                        padding="0px"
                        fontSize="25px"
                      >
                        {TICK}
                      </Button>
                      <Button
                        onClick={handleCancelReplyClick}
                        cursor="pointer"
                        pos="absolute"
                        right="0px"
                        top="0px"
                        colorScheme="transperent"
                        color="red"
                        size="sm"
                        fontSize="22px"
                        marginTop="44px"
                      >
                        X
                      </Button>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </>
  );
};

ChatMessageBox.propTypes = {
  message: PropTypes.object.isRequired,
  sameAuthor: PropTypes.bool.isRequired,
};

export default ChatMessageBox;
