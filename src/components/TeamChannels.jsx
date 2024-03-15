import { Button, Grid, GridItem } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { listenForNewTeamChannels } from "../services/channel.servicies";
import { v4 } from "uuid";
import CreateChannelPopUp from "./CreateChannelPopUp";
import AppContext from "../providers/AppContext";
import TeamMembers from "./TeamMembers";

const TeamChannels = ({ selectedTeam }) => {

  const { userData } = useContext(AppContext);
  const { teamId, channelId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const unsubscribe = listenForNewTeamChannels((snapshot) => {
      const teamChannels = snapshot.exists() ? snapshot.val() : [];
      setChannels(Object.values(teamChannels))
    }, teamId);
    return () => unsubscribe();



    // getTeamChannels(teamId)
    //   .then((teamChannels) => setChannels(teamChannels))
  }, [teamId, channelId]);

  return (
    <>
      <Grid templateColumns="repeat(10, 1fr)">
        <GridItem h='50vh' as='aside' border='2px solid orange' colSpan={1}>
          {channels &&
            <>
              {channels.map((channel) => channel.id === channelId ?
                <Button key={v4()} onClick={() => navigate(`/teams/${teamId}/channels/${channel.id}`)} style={{ backgroundColor: 'yellow' }}>{channel.title}</Button>
                : <Button key={v4()} onClick={() => navigate(`/teams/${teamId}/channels/${channel.id}`)} >{channel.title}</Button>
              )}
              {selectedTeam.owner === userData.handle && <CreateChannelPopUp />}
            </>}
        </GridItem>
        <TeamMembers selectedTeam={selectedTeam}/>
      </Grid>
    </>
  );
};

export default TeamChannels;