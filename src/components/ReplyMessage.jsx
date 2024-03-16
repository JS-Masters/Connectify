import { useContext, useState } from 'react';
import { Box, Textarea, Button, Avatar, Text, HStack } from '@chakra-ui/react';
import { v4 } from 'uuid';
import PropTypes from 'prop-types';
import AppContext from '../providers/AppContext';
import { useParams } from 'react-router-dom';
import { deleteReplyFromChat, editReplyInChat } from '../services/chat.services';
import { getUserAvatarByHandle } from '../services/user.services';


const ReplyMessage = ({
  reply,
  message
}) => {
  // const { userData } = useContext(AppContext);
  // const { chatId } = useParams();
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedReplyContent, setEditedReplyContent] = useState(reply.content);
  // const [isDeletingReply, setIsDeletingReply] = useState(false);

  // const handleEditClick = () => {
  //   setIsEditing(true);
  // };

  // const handleSaveClick = () => {
  //   editReplyInChat(chatId, message.id, reply.id, editedReplyContent)
  //     .then(() => setIsEditing(false))
  // };

  // const handleCancelClick = () => {
  //   setIsEditing(false);
  // };

  // const handleDeleteClick = () => {
  //   getUserAvatarByHandle(userData.handle)
  //     .then((avatarUrl) => deleteReplyFromChat(chatId, message.id, reply.id, userData.handle, avatarUrl))
  //     .then(() => setIsDeletingReply(true))
  // };

  // return (
  //   <>
  //    <span><img style={{ width: '20px', height: '20px', display: 'inline' }} src='../../public/down-arrow.png' /></span>
  //     <HStack>
  //       <Avatar src={reply.avatarUrl} style={{ marginLeft: '10px', width: '25px', height: '25px' }} />
  //       {'deleteMessage' in reply ? <Text fontSize="sm" fontWeight="bold">{reply.deletedBy}</Text> : <Text fontSize="sm" fontWeight="bold">{reply.author}</Text>}

  //       <Text fontSize="sm">{reply.createdOn}</Text>
  //     </HStack>
  //     {userData.handle === reply.author && (
  //             <>
  //               <Button size="xs" onClick={handleEditClick} mr={2}>Edit</Button>
  //               <Button size="xs" onClick={handleDeleteClick}>Delete</Button>
  //             </>
  //           )}
  //   {'deleteMessage' in reply ? (
  //         <Text>
  //           {reply.deleteMessage} on {reply.deletedOn}
  //         </Text>
  //       ) : (
  //         <Text>
  //           {isEditing ? (
  //             <Box mt={2}>
  //               <Textarea value={editedReplyContent} onChange={(e) => setEditedReplyContent(e.target.value)} />
  //               <Box mt={2}>
  //                 <Button size="sm" onClick={handleSaveClick} mr={2}>Save</Button>
  //                 <Button size="sm" onClick={handleCancelClick}>Cancel</Button>
  //               </Box>
  //             </Box>
  //           ) : (
  //             <Box mt={2}>
  //               <Box display="flex" justifyContent="space-between">
  //                 <Box>
  //                   <Text>{reply.content}</Text>
  //                 </Box>
  //                 <Box>
  //                   {'reactions' in reply && Object.values(reply.reactions).map((reaction) => (
  //                     <span key={v4()}>{reaction}</span>
  //                   ))}
  //                 </Box>
  //               </Box>
  //             </Box>
  //           )}
  //         </Text>
  //       )}
  //   </>
  // );
};


export default ReplyMessage;
