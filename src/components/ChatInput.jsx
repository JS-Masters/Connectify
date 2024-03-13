import PropTypes from 'prop-types'

import { useContext, useState } from "react";
import { Form, useParams } from "react-router-dom";
import { addMessageToChat } from "../services/chat.services";
import AppContext from "../providers/AppContext";

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Box, Input } from "@chakra-ui/react";
import { FaRegSmile } from "react-icons/fa";
import { SlPicture } from "react-icons/sl";
import { PiGifFill } from "react-icons/pi";
import { uploadMessageFile } from "../services/storage.service";
import { DeleteIcon } from "@chakra-ui/icons";
import Giphy from './Giphy/Giphy';
import FilePreview from './FIlePreview';



const ChatInput = ({ disabled }) => {

    const [msg, setMsg] = useState('');
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [fileUrl, setFileUrl] = useState('');
    const [isUserLeft, setIsUserLeft] = useState(false);
    const [giphy, setGiphy] = useState(false);


    const { chatId } = useParams();
    const { userData } = useContext(AppContext);

    const handleFile = (e) => {
        e.preventDefault();

        if (e.target.files[0] !== null) {
            const file = e.target.files[0];
            const filePath = `${userData.handle}/${chatId}/${file.name}`;
            uploadMessageFile(fileUrl => {
                setFileUrl(fileUrl);
            }, file, filePath);
        }
    }

    const sendMessage = async (event) => {
        event.preventDefault();

        if (!msg.trim() && !fileUrl) {
            return;
        }

        await addMessageToChat(chatId, msg, userData.handle, fileUrl, userData.avatarUrl);
        setMsg('');
        setFileUrl('');
    };

    const handleGif = (url) => {
        setFileUrl(url);
        setGiphy(false);
    }

    return (
        <Form onSubmit={sendMessage} style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'space-around', bottom: 30, width: '70%', backgroundColor: '#242424', color: 'white', padding: '10px', borderRadius: '5px' }}>
            {isPickerVisible && <Box position='absolute' top='-430px' right='0'>
                <Picker data={data} previewPosition='none' onEmojiSelect={(e) => {
                    setPickerVisible(!isPickerVisible);
                    setMsg(msg + e.native);
                }} />
            </Box>}
            {fileUrl && <Box position='absolute' width='fit-content' h='200px' borderRadius='3px' p='20px' top='-189px' left='0' bg='gray.800'>
                <FilePreview fileUrl={fileUrl} />
                <DeleteIcon position="absolute" cursor='pointer' top="5px" right="5px" color="red.500" onClick={() => { setFileUrl('') }} />
            </Box>}
            {giphy && <Giphy handleGif={handleGif} />}
            <Input value={msg} onChange={(event) => setMsg(event.target.value)} placeholder="type here..." w='80%' disabled={isUserLeft || disabled} />
            <FaRegSmile onClick={() => { setGiphy(false); setPickerVisible(!isPickerVisible) }} style={{ fontSize: '30px', cursor: 'pointer' }} />
            <label htmlFor="file" onClick={() => { setGiphy(false); setPickerVisible(false) }} style={{ fontSize: '30px', cursor: 'pointer' }}><SlPicture /></label>
            <Input type="file" id="file" style={{ display: 'none' }} onChange={handleFile} />
            <label style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                color: 'white',
            }} onClick={() => { setPickerVisible(false); setGiphy(!giphy) }}>
                <PiGifFill fontSize='40px' />
            </label>
        </Form>
    )
}

ChatInput.propTypes = {
    disabled: PropTypes.bool
}


export default ChatInput;