import { Button, Input, useToast } from "@chakra-ui/react"
import { useContext, useState } from "react";
import Popup from 'reactjs-popup';
import AppContext from "../providers/AppContext";
import { addChannelToTeam } from "../services/channel.servicies";
import { useNavigate, useParams } from "react-router-dom";

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
      {<Button style={{ width: '150px', height: '45px', backgroundColor: 'green', display:'block' }}>+</Button>}
      modal nested>
      {
        close => (
          <div className='modal'>
            <Button style={{ float: "right", margin: "15px" }} onClick=
              {() => handlePopUpClose(close)}>
              X
            </Button>
            <div style={{ width: '300px', height: '300px', border: '2px solid black', padding: "30px" }} className='content'>
              <Input
                type="text"
                value={channelName}
                onChange={updateChannelNameInputField}
                placeholder="Channel name..."
              />
              <br />
              <Button onClick={() => handleCreateChannelClick(close)}>Create Channel</Button>
            </div>
          </div>
        )
      }
    </Popup>
  );
};

export default CreateChannelPopUp;