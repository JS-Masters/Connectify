import { useContext, useEffect, useState } from "react";
import { getTeamById, getTeamMembers, listenForNewTeamMember } from "../services/team.services";
import { getUsersAvatarsByHandles } from "../services/user.services";
import { Avatar, AvatarBadge, GridItem, Heading } from "@chakra-ui/react";
import UserStatusIcon from "./UserStatusIconChats";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import AddMemberToTeamPopUp from "./AddMemberToTeamPopUp";
import AppContext from "../providers/AppContext";


const TeamMembers = () => {

  const { userData } = useContext(AppContext);
  const { teamId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});


  useEffect(() => {
    const unsubscribe = listenForNewTeamMember((snapshot) => {
      const teamMembers = snapshot.exists() ? snapshot.val() : [];
      getUsersAvatarsByHandles(Object.keys(teamMembers))
      .then(setTeamMembers)
    }, teamId);
    return () => unsubscribe();
  }, [teamId]);

  useEffect(() => {
    getTeamById(teamId)
      .then(setSelectedTeam)
  }, [teamId])


  return (
    <GridItem h='50vh' as='aside' border='2px solid orange' colSpan={1}>
      {teamMembers.map((member) =>
        <span key={v4()}>
          <Avatar size='sm' src={member.avatarUrl}>
            <AvatarBadge w="1em" bg="teal.500">
              {<UserStatusIcon userHandle={member.handle} iconSize={'5px'} />}
            </AvatarBadge>
          </Avatar>
          <Heading display='inline' as='h3' size='sm'>{member.handle}</Heading>
          <br />
        </span>
      )}
      {selectedTeam.owner === userData.handle && <AddMemberToTeamPopUp />}
    </GridItem>
  )
};

export default TeamMembers;