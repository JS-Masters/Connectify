// import PropTypes from 'prop-types'

import { useContext, useState } from "react";
import { Form, useParams } from "react-router-dom";
import { addMessageToChat } from "../services/chat.services";
import AppContext from "../providers/AppContext";

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Box, Input } from "@chakra-ui/react";
import { FaRegSmile } from "react-icons/fa";
import { SlPicture } from "react-icons/sl";


const ChatInput = () => {

    const [msg, setMsg] = useState('');
    const [isPickerVisible, setPickerVisible] = useState(false);

    const { chatId } = useParams();
    const { userData } = useContext(AppContext);


    const sendMessage = async (event) => {
        event.preventDefault();
        await addMessageToChat(chatId, msg, userData.handle);
        setMsg('');
    };

    return (
        <Form onSubmit={sendMessage} style={{ position: 'absolute', bottom: 30, width: '70%', backgroundColor: '#242424', color: 'white', padding: '10px', borderRadius: '5px' }}>
            {isPickerVisible && <Box position='absolute' top='-430px' right='0'>
                <Picker data={data} previewPosition='none' onEmojiSelect={(e) => {
                    setPickerVisible(!isPickerVisible);
                    setMsg(msg + e.native);
                }} />
            </Box>}
            <Input value={msg} onChange={(event) => setMsg(event.target.value)} placeholder="type here..." w='80%' />
            <FaRegSmile onClick={() => setPickerVisible(!isPickerVisible)} style={{ fontSize: '30px', cursor: 'pointer' }} />
        </Form>
    )
}

ChatInput.propTypes = {}

export default ChatInput;