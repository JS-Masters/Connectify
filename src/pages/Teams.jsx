import { useContext, useEffect, useState } from "react";
import CreateTeamPopUp from "../components/CreateTeamPopUp";
import AppContext from "../providers/AppContext";
import { getTeamById, getTeamsByUserHandle } from "../services/team.services";
import { Button } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import TeamChannels from "../components/TeamChannels";
import TeamChannelContent from "../components/TeamChannelContent";
import { v4 } from "uuid";
import CreateMeeting from "../components/CreateMeetingPopUp";

const Teams = () => {

  const { userData } = useContext(AppContext);
  const { teamId, channelId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      getTeamsByUserHandle(userData.handle)
        .then((userTeams) => {
          if (userTeams) {
            setTeams(Object.values(userTeams));
          };
        })
    };
  }, [teamId, channelId]);

  useEffect(() => {
    if(teamId) {
      getTeamById(teamId).then((team) => setSelectedTeam(team));
    }
  }, [teamId]);

  return (
    <>
      {<CreateTeamPopUp />}
      {teams && teams.map((team) => <Button key={v4()} onClick={() => navigate(`/teams/${team.id}`)} style={{ width: 'fit-content', height: '45px', border: '2px solid black' }}>{team.teamName}</Button>)}
      {teamId && <TeamChannels />}
      {teamId && selectedTeam.owner === userData.handle && <CreateMeeting teamName={selectedTeam.teamName}/>}
      {channelId && <TeamChannelContent />}
    </>
  );
};

export default Teams;