import { useContext, useEffect, useState } from "react";
import CreateTeamPopUp from "../../components/CreateTeamPopUp/CreateTeamPopUp";
import AppContext from "../../providers/AppContext";
import { getTeamById, leaveTeam, listenForTeamsByUserHandle } from "../../services/team.services";
import { Box, Button, Flex, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import TeamChannels from "../../components/TeamChannels/TeamChannels";
import { v4 } from "uuid";
import CreateMeetingPopUp from "../../components/CreateMeetingPopUp";
import "./Teams.css";
import TeamMembers from "../../components/TeamMembers";
import ChatMessages from "../../components/ChatMessages/ChatMessages";

const Teams = () => {

  const { userData } = useContext(AppContext);
  const { teamId, chatId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      const unsubscribe = listenForTeamsByUserHandle((snapshot) => {
        const userTeamsData = snapshot.exists() ? snapshot.val() : [];
        (Boolean(Object.keys(userTeamsData).length)) ? setTeams(Object.values(userTeamsData)) : setTeams(userTeamsData);
      }, userData.handle);

      return () => unsubscribe();
    }
  }, [teamId, chatId]);

  useEffect(() => {
    if (teamId) {
      getTeamById(teamId).then((team) => setSelectedTeam(team));
    }
  }, [teamId]);

  const handleLeaveTeamClick = () => {
    leaveTeam(teamId, userData.handle)
      .then(() => navigate('/teams'))
  };

  return (
    <>


      <Flex spacing="12%" marginRight="21%" marginLeft="19%" >
        <Box>
          <CreateTeamPopUp />
        </Box>
        <HStack id="teams-hstack" spacing="5%" overflow="hidden" overflowX="auto" >
          {Boolean(teams.length) && teams.map((team) => <NavLink key={v4()} to={`/teams/${team.id}`}
            style={{ textAlign: 'center' }}
          >
            <Box id="team-name-box" style={{ display: 'flex', alignItems: 'center', border: '1px solid bisque', borderRadius: '10px', color: 'white', width: '150px', height: '74px', marginBottom: '12px', marginTop: '40px' }}>
              <Text m='auto'>
                {team.teamName}
              </Text>
            </Box>
          </NavLink>)}
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(5, 1fr)">
        <GridItem h='70vh' w='30vh' as='aside' colSpan={1}>
          {teamId && <TeamChannels selectedTeam={selectedTeam} />}
        </GridItem>
        <GridItem h='70vh'  colSpan={3}>
        {chatId && <ChatMessages />}
        </GridItem>
        {chatId &&
          <GridItem h='70vh' colSpan={1}>
            <TeamMembers selectedTeam={selectedTeam} />
            {teamId && selectedTeam.owner === userData.handle ?
            <CreateMeetingPopUp teamName={selectedTeam.teamName} />
            : <Button onClick={handleLeaveTeamClick} style={{ color: 'red' }}>Leave Team</Button>}
          </GridItem>
        }
      </Grid>






    </>
  );
};

export default Teams;