import { useContext, useEffect, useState } from "react";
import { getTeamById, listenForNewTeamMember } from "../services/team.services";
import { changeUserCurrentStatusInDb, getUserLastStatusByHandle, getUserStatusByHandle, getUsersAvatarsByHandles } from "../services/user.services";
import { Avatar, AvatarBadge, GridItem, Heading, useToast } from "@chakra-ui/react";
import UserStatusIcon from "./UserStatusIconChats";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import AddMemberToTeamPopUp from "./AddMemberToTeamPopUp";
import AppContext from "../providers/AppContext";
import { ChatIcon, PhoneIcon } from "@chakra-ui/icons";
import { addIncomingCallToDb, createCall, endCall } from "../services/call.services";
import { addUserToCall, createDyteCall } from "../services/dyte.services";
import { statuses } from "../common/constants";
import SingleCallRoom from "./SingleCallRoom";


const TeamMembers = ({selectedTeam}) => {

  const { userData } = useContext(AppContext);
  const { teamId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  // const [selectedTeam, setSelectedTeam] = useState({});
  const [token, setToken] = useState('');
  const [userToCall, setUserToCall] = useState('');
  const [joinedCallDyteId, setJoinedCallDyteId] = useState('');
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = listenForNewTeamMember((snapshot) => {
      const teamMembers = snapshot.exists() ? snapshot.val() : [];
      getUsersAvatarsByHandles(Object.keys(teamMembers))
      .then(setTeamMembers)
    }, teamId);
    return () => unsubscribe();
  }, [teamId]);

  // useEffect(() => {
  //   getTeamById(teamId)
  //     .then(setSelectedTeam)
  // }, [teamId])


  const showToast = (title, desc, status) => {
    toast({
      title: title,
      description: desc,
      duration: 3000,
      isClosable: true,
      status: status,
      position: "top"
    });
  };

  const startCall = async (userToCallHandle) => {
    try {
      const userToCallCurrentStatus = await getUserStatusByHandle(userToCallHandle);

      if (userToCallCurrentStatus === statuses.offline) {
        showToast('User is Offline!', `${userToCallHandle} is currently offline. Please try again later`, "info");
      } else if (userToCallCurrentStatus === statuses.inMeeting) {
        showToast('User is Busy!', `${userToCallHandle} is currently In a meeting. Please try again later`, "info");
      } else {
        await createCall(userData.handle, userToCallHandle)
        .then((newCallId) => createDyteCall(newCallId))
        .then((roomID) => addIncomingCallToDb(userToCallHandle, userData.handle, roomID))
        .then((roomID) => addUserToCall((data) => setToken(data), userData, roomID))
        .then((roomID) => {
          setUserToCall(userToCallHandle);
          setJoinedCallDyteId(roomID);
        });
      }   
    } catch (error) {
      console.log(error.message);
    };
  };

  const leaveCall = async () => {
    endCall(userToCall, joinedCallDyteId)
      .then(() => getUserLastStatusByHandle(userData.handle))
      .then((previousStatus) => {
        changeUserCurrentStatusInDb(userData.handle, previousStatus)
      })
      .then(() => {
        setToken('');
        setUserToCall('');
        setJoinedCallDyteId('');
      })
      .catch((error) => console.log(error.message))
  };

  return (
    <> 
    <GridItem h='50vh' as='aside' border='2px solid orange' colSpan={1}>
      {teamMembers.map((member) =>
        <span key={member.handle}>
          <Avatar size='sm' src={member.avatarUrl}>
            <AvatarBadge w="1em" bg="teal.500">
              {<UserStatusIcon userHandle={member.handle} iconSize={'5px'} />}
            </AvatarBadge>
          </Avatar>
          <Heading display='inline' as='h3' size='sm'>{member.handle}</Heading>
          {/* <ChatIcon style={{float:'right', margin:'5px'}}/> */}
          {member.handle !== userData.handle && <PhoneIcon onClick={() => startCall(member.handle)} style={{float:'right', margin:'5px', cursor:'pointer'}}/>}
          <br />
        </span>
      )}
      {selectedTeam.owner === userData.handle && <AddMemberToTeamPopUp />}
    </GridItem>
    {token && <div style={{ height: '50vh', width: 'auto' }}><SingleCallRoom token={token} leaveCall={leaveCall} /></div>}
    </>
  )
};

export default TeamMembers;