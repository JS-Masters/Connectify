// import { useContext, useEffect, useState } from "react";
// import { Form, useParams } from "react-router-dom";
// import { addMessageToChannel, deleteMessageFromChannel, editMessageInChannel, getChannelMessagesById } from "../services/channel.servicies";
// import { Input } from "@chakra-ui/react";
// import ChatMessageBox from "./ChatMessageBox";
// import { v4 } from "uuid";
// import AppContext from "../providers/AppContext";


// const TeamChannelContent = () => {

//   const {userData} = useContext(AppContext);
//   const { teamId, channelId } = useParams();
//   const [channelMessages, setChannelMessages] = useState([]);

//   useEffect(() => {

//       const unsubscribe = getChannelMessagesById((snapshot) => {
//         const channelMsgsData = snapshot.exists() ? snapshot.val() : {};
//         setChannelMessages(Object.values(channelMsgsData));
//       }, teamId, channelId);
  
//       return () => unsubscribe();
    
//   }, [teamId, channelId]);

//   const sendMessage = async (event) => {
//     event.preventDefault();
//     const message = event.target.elements.newMessage.value;
//     await addMessageToChannel(teamId, channelId, message, userData.handle);
//     event.target.elements.newMessage.value = "";
//   };

//   const handleEditMessage = async (messageId, newContent) => {
//     try { 
//       // throw new Error ('FATAL ERROR :)')
//       await editMessageInChannel(teamId, channelId, messageId, newContent);
//     } catch(error) {
//       // showToast(error);
//       // setError(error.message);
//     };  
//   };

//   const handleDeleteMessage = async (messageId) => {
//     await deleteMessageFromChannel(teamId, channelId, messageId, userData.handle);
//   }; 

//   return (
//     <div>
//       {channelMessages &&
//         channelMessages.map((message) => (
//           <ChatMessageBox
//             key={v4()}
//             message={message}
//             onEdit={handleEditMessage}
//             onDelete={handleDeleteMessage}
//           />
//         ))}
//       <Form onSubmit={sendMessage}>
//         <Input placeholder="type here..." name="newMessage" />
//       </Form>
//     </div>
//   );
// };

// export default TeamChannelContent;