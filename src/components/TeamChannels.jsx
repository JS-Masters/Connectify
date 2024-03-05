import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamChannels } from "../services/channel.servicies";
import { v4 } from "uuid";



const TeamChannels = () => {

  const { teamId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    getTeamChannels(teamId)
    .then((teamChannels) => setChannels(teamChannels))
  }, [teamId]);

  return (
    <>
      {channels &&
        <div style={{ width: '400px' }}>
          {channels.map((channel) => <Button key={v4()} onClick={() => navigate(`channels/${channel.id}`)} style={{ width: '400px' }}>{channel.title}</Button>)}
        </div>}
    </>
  );
};

export default TeamChannels;