import { Box, Button, Flex, Grid, GridItem, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { listenForNewTeamChannels } from "../services/channel.servicies";
import { v4 } from "uuid";
import CreateChannelPopUp from "./CreateChannelPopUp";
import AppContext from "../providers/AppContext";
import TeamMembers from "./TeamMembers";
// import TeamChannelContent from "./TeamChannelContent";
import ChatMessages from "./ChatMessages";

const TeamChannels = ({ selectedTeam }) => {

  const { userData } = useContext(AppContext);
  const { teamId, chatId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const unsubscribe = listenForNewTeamChannels((snapshot) => {
      const teamChannels = snapshot.exists() ? snapshot.val() : [];
      setChannels(Object.values(teamChannels))
    }, teamId);
    return () => unsubscribe();

  }, [teamId, chatId]);

  return (
    <>
      <Flex>
        <VStack w='15%'>
          {channels &&
            <>
              {channels.map((channel) => 
              // CONDITION chatId && chatId === 
                <Button key={v4()} onClick={() => navigate(`/teams/${teamId}/channels/${channel.chatId}`)} style={{ backgroundColor: 'yellow' }}>{channel.title}</Button>
        
              )
              }
              {selectedTeam.owner === userData.handle && <CreateChannelPopUp />}
            </>}
        </VStack>
        {/* {channelId && <TeamChannelContent />} */}
        {chatId && <ChatMessages />}
        <TeamMembers selectedTeam={selectedTeam} />
      </Flex>
    </>
  );
};

export default TeamChannels;