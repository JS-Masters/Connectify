import PropTypes from "prop-types";
import { Box, HStack, Heading } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listenForNewTeamChannels } from "../../services/channel.servicies";
import { v4 } from "uuid";
import CreateChannelPopUp from "../CreateChannelPopUp/CreateChannelPopUp";
import AppContext from "../../providers/AppContext";
import "./TeamChannels.css";

const TeamChannels = ({ selectedTeam }) => {
  const { userData } = useContext(AppContext);
  const { teamId, chatId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const unsubscribe = listenForNewTeamChannels((snapshot) => {
      const teamChannels = snapshot.exists() ? snapshot.val() : [];
      setChannels(Object.values(teamChannels));
    }, teamId);
    return () => unsubscribe();
  }, [teamId, chatId]);

  return (
    <>
      <Box
        id="team-channels-main-box"
        w="90%"
        h="88%"
        marginTop="6%"
        paddingLeft="30px"
        paddingRight="30px"
        alignItems="center"
        overflow="hidden"
        overflowY="auto"
      >
        {channels &&
          channels.map((channel) => (
            <Box
              id="single-channel-box"
              onClick={() =>
                navigate(`/teams/${teamId}/channels/${channel.chatId}`)
              }
              border="1px solid gray"
              borderRadius="10px"
              margin="8px"
              padding="9px"
              size="md"
              cursor="pointer"
              position="relative"
              key={v4()}
            >
              <HStack style={{ marginRight: "10px", justifyContent: "center" }}>
                <Heading
                  className="channel-title"
                  display="inline"
                  as="h3"
                  size="md"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {channel.title}
                </Heading>
              </HStack>
            </Box>
          ))}
        <HStack style={{ justifyContent: "center", overflow: "" }}>
          {selectedTeam.owner === userData.handle && <CreateChannelPopUp />}
        </HStack>
      </Box>
    </>
  );
};

TeamChannels.propTypes = {
  selectedTeam: PropTypes.object.isRequired,
};

export default TeamChannels;
