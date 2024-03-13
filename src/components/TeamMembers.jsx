import { useEffect, useState } from "react";
import { getTeamMembers } from "../services/team.services";
import { getUsersAvatarsByHandles } from "../services/user.services";
import { Avatar, AvatarBadge, Button, GridItem, Heading } from "@chakra-ui/react";
import UserStatusIcon from "./UserStatusIconChats";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import AddMemberToTeamPopUp from "./AddMemberToTeamPopUp";


const TeamMembers = () => {

  const { teamId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    getTeamMembers(teamId)
      .then((teamMembersHandles) => getUsersAvatarsByHandles(Object.keys(teamMembersHandles)))
      .then(setTeamMembers)
  }, []);


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
      {<AddMemberToTeamPopUp/>}
    </GridItem>
  )
};

export default TeamMembers;