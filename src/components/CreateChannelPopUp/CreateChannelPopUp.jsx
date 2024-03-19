import { Button, Input, useToast } from "@chakra-ui/react"
import { useContext, useState } from "react";
import Popup from 'reactjs-popup';
import AppContext from "../../providers/AppContext";
import { addChannelToTeam } from "../../services/channel.servicies";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateChannelPopUp.css";

const CreateChannelPopUp = () => {

  const { userData } = useContext(AppContext);
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState('');

  const toast = useToast();

  const showToast = (desc, status) => {
    toast({
      title: "Create team",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  const updateChannelNameInputField = (event) => {
    setChannelName(event.target.value);
  };

  const handleCreateChannelClick = (close) => {
    if (!channelName) {
      showToast('Please, choose name for the channel', 'info');
    } else {
      addChannelToTeam(teamId, channelName, userData.handle)
        .then((newChannelId) => {
          handlePopUpClose(close);
          navigate(`/teams/${teamId}/channels/${newChannelId}`);
        });
    };
  };

  const handlePopUpClose = (close) => {
    close();
    setChannelName('');
  };

  return (
    <Popup trigger=
      {<Button id="new-channel-button" marginBottom='50px'>New Channel</Button>}
      modal nested
      closeOnDocumentClick={false}
      closeOnEscape={false}>
      {
        close => (
          <div className='modal' style={{ width: '500px', height: '250px', backgroundImage: "url('/pop-up-background2.jpg')" }}>
            <Button id="close-create-channel-button" size='sm' style={{ float: "right", margin: "10px", backgroundColor: 'transparent' }} onClick=
              {() => handlePopUpClose(close)}>
              X
            </Button>
            <div className='content' style={{ padding: "0 35px" }}>
              <Input
                id="create-channel-input"
                type="text"
                value={channelName}
                onChange={updateChannelNameInputField}
                placeholder="Channel name..."
              />
              <br />
              <Button id="create-channel-button" onClick={() => handleCreateChannelClick(close)}
                style={{ position: 'absolute', bottom: '0', marginBottom: '60px', marginLeft: '20px' }}
              >Create Channel</Button>
            </div>
          </div>
        )
      }
    </Popup>
  );
};

export default CreateChannelPopUp;