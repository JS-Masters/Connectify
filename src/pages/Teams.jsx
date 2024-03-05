import { useContext, useEffect, useState } from "react";
import CreateTeamPopUp from "../components/CreateTeamPopUp";
import AppContext from "../providers/AppContext";
import { getTeamsByIds, getTeamsByUserHandle } from "../services/team.services";
import { Button } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import TeamChannels from "../components/TeamChannels";
import TeamChannelContent from "../components/TeamChannelContent";
import { v4 } from "uuid";


const Teams = () => {

  const { userData } = useContext(AppContext);
  const { teamId, channelId } = useParams();
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      getTeamsByUserHandle(userData.handle)
        .then((userTeamsIds) => getTeamsByIds(Object.keys(userTeamsIds)))
        .then((userTeams) => setTeams(userTeams))
    };
  }, []);

  return (
    <>
      {teams && teams.map((team) => <Button key={v4()} onClick={() => navigate(`${team.id}`)} style={{ width: 'fit-content', height: '45px', border: '2px solid black' }}>{team.teamName}</Button>)}
      {<CreateTeamPopUp />}
      {teamId && <TeamChannels/>}
      {channelId && <TeamChannelContent/>}
    </>
  );
};

export default Teams;