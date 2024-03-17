import { useContext, useEffect, useState } from "react";
import CreateTeamPopUp from "../components/CreateTeamPopUp";
import AppContext from "../providers/AppContext";
import { getTeamById, leaveTeam, listenForTeamsByUserHandle } from "../services/team.services";
import { Button } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import TeamChannels from "../components/TeamChannels";
// import TeamChannelContent from "../components/TeamChannelContent";
import { v4 } from "uuid";
import CreateMeetingPopUp from "../components/CreateMeetingPopUp";

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
      {<CreateTeamPopUp />}
      {Boolean(teams.length) && teams.map((team) => <Button key={v4()} onClick={() => navigate(`/teams/${team.id}`)} style={{ width: 'fit-content', height: '45px', border: '2px solid black' }}>{team.teamName}</Button>)}
      {teamId && <TeamChannels selectedTeam={selectedTeam} />}
      {teamId && selectedTeam.owner === userData.handle && <CreateMeetingPopUp teamName={selectedTeam.teamName} />}
      {teamId && selectedTeam.owner !== userData.handle && <Button onClick={handleLeaveTeamClick} style={{ color: 'red' }}>Leave Team</Button>}
    </>
  );
};

export default Teams;