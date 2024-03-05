import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamChannels } from "../services/channel.servicies";
import { v4 } from "uuid";
import CreateChannelPopUp from "./CreateChannelPopUp";

const TeamChannels = () => {

  const { teamId, channelId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    getTeamChannels(teamId)
      .then((teamChannels) => setChannels(teamChannels))
  }, [teamId, channelId]);

  return (
    <>
      {channels &&
        <div style={{ width: '400px' }}>
          {channels.map((channel) => channel.id === channelId ?
            <Button key={v4()} onClick={() => navigate(`/teams/${teamId}/channels/${channel.id}`)} style={{ width: '400px', backgroundColor: 'yellow' }}>{channel.title}</Button>
            : <Button key={v4()} onClick={() => navigate(`/teams/${teamId}/channels/${channel.id}`)} style={{ width: '400px' }}>{channel.title}</Button>
          )}
          {<CreateChannelPopUp />}
        </div>}
    </>
  );
};

export default TeamChannels;