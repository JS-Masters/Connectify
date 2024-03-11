 import PropTypes from 'prop-types'

import { useContext, useState} from "react";
import { Form, useParams } from "react-router-dom";
import { addMessageToChat } from "../services/chat.services";
import AppContext from "../providers/AppContext";

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Box, Image, Input } from "@chakra-ui/react";
import { FaRegSmile } from "react-icons/fa";
import { SlPicture } from "react-icons/sl";
import { uploadMessagePhoto } from "../services/storage.service";
import { DeleteIcon } from "@chakra-ui/icons";



const ChatInput = ({disabled}) => {

    const [msg, setMsg] = useState('');
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [picURL, setPicURL] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isUserLeft, setIsUserLeft] = useState(false);


    const { chatId } = useParams();
    const { userData } = useContext(AppContext);

    const handlePic = (e) => {
        e.preventDefault();

        if (e.target.files[0] !== null) {
            const file = e.target.files[0];
            const filePath = `${userData.handle}/${chatId}/${file.name}`;
            uploadMessagePhoto(photoURL => {
                setPicURL(photoURL);
                setShowMenu(true);
            }, file, filePath);
        }
    }

    const sendMessage = async (event) => {
        event.preventDefault();

        if (!msg.trim() && !picURL) {
            return;
        }

        await addMessageToChat(chatId, msg, userData.handle, picURL, userData.avatarUrl);
        setMsg('');
        setPicURL('');
        setShowMenu(false);
    };


    return (
        <Form onSubmit={sendMessage} style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'space-around', bottom: 30, width: '70%', backgroundColor: '#242424', color: 'white', padding: '10px', borderRadius: '5px' }}>
            {isPickerVisible && <Box position='absolute' top='-430px' right='0'>
                <Picker data={data} previewPosition='none' onEmojiSelect={(e) => {
                    setPickerVisible(!isPickerVisible);
                    setMsg(msg + e.native);
                }} />
            </Box>}
            {showMenu && <Box position='absolute' width='100%' p='20px' top='-135px' bg='gray.800'>
                <Image src={picURL} alt="Image" w='200px' />
                <DeleteIcon position="absolute" cursor='pointer' top="0" right="0" color="red.500" onClick={() => { setShowMenu(false); setPicURL('') }} />
                </Box>}
      <Input value={msg} onChange={(event) => setMsg(event.target.value)} placeholder="type here..." w='80%' disabled={isUserLeft || disabled} />
      <FaRegSmile onClick={() => setPickerVisible(!isPickerVisible)} style={{ fontSize: '30px', cursor: 'pointer' }} />
      <label htmlFor="file" style={{ fontSize: '30px', cursor: 'pointer' }}><SlPicture /></label>
      <Input type="file" id="file" style={{ display: 'none' }} onChange={handlePic} />
    </Form>
    )
}

ChatInput.propTypes = {
    disabled: PropTypes.bool
}


export default ChatInput;