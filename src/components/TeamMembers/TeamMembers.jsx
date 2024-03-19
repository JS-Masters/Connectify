import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { listenForNewTeamMember } from "../../services/team.services";
import {
  changeUserCurrentStatusInDb,
  getUserLastStatusByHandle,
  getUserStatusByHandle,
  getUsersAvatarsByHandles,
} from "../../services/user.services";
import {
  Avatar,
  AvatarBadge,
  HStack,
  Heading,
  VStack,
  useToast,
  Image,
  Spacer,
} from "@chakra-ui/react";
import UserStatusIcon from "../UserStatusIconChats";
import { useParams } from "react-router-dom";

import AppContext from "../../providers/AppContext";
import { PhoneIcon } from "@chakra-ui/icons";
import {
  addIncomingCallToDb,
  createCall,
  endCall,
} from "../../services/call.services";
import { addUserToCall, createDyteCall } from "../../services/dyte.services";
import { statuses } from "../../common/constants";
import SingleCallRoom from "../SingleCallRoom";
import "./TeamMembers.css";

const TeamMembers = ({ selectedTeam }) => {
  const { userData } = useContext(AppContext);
  const { teamId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamOwner, setTeamOwner] = useState(null);
  const [token, setToken] = useState("");
  const [userToCall, setUserToCall] = useState("");
  const [joinedCallDyteId, setJoinedCallDyteId] = useState("");
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = listenForNewTeamMember((snapshot) => {
      const teamMembers = snapshot.exists() ? snapshot.val() : [];
      getUsersAvatarsByHandles(Object.keys(teamMembers)).then(setTeamMembers);
    }, teamId);
    return () => unsubscribe();
  }, [teamId]);

  useEffect(() => {
    if (teamMembers) {
      setTeamOwner(teamMembers.find((m) => m.handle === selectedTeam.owner));
    }
  }, [teamMembers]);

  const showToast = (title, desc, status) => {
    toast({
      title: title,
      description: desc,
      duration: 3000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  const startCall = async (userToCallHandle) => {
    try {
      const userToCallCurrentStatus = await getUserStatusByHandle(
        userToCallHandle
      );

      if (userToCallCurrentStatus === statuses.offline) {
        showToast(
          "User is Offline!",
          `${userToCallHandle} is currently offline. Please try again later`,
          "info"
        );
      } else if (userToCallCurrentStatus === statuses.inMeeting) {
        showToast(
          "User is Busy!",
          `${userToCallHandle} is currently In a meeting. Please try again later`,
          "info"
        );
      } else {
        await createCall(userData.handle, userToCallHandle)
          .then((newCallId) => createDyteCall(newCallId))
          .then((roomID) =>
            addIncomingCallToDb(userToCallHandle, userData.handle, roomID)
          )
          .then((roomID) =>
            addUserToCall((data) => setToken(data), userData, roomID)
          )
          .then((roomID) => {
            setUserToCall(userToCallHandle);
            setJoinedCallDyteId(roomID);
          });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const leaveCall = async () => {
    endCall(userToCall, joinedCallDyteId)
      .then(() => getUserLastStatusByHandle(userData.handle))
      .then((previousStatus) => {
        changeUserCurrentStatusInDb(userData.handle, previousStatus);
      })
      .then(() => {
        setToken("");
        setUserToCall("");
        setJoinedCallDyteId("");
      })
      .catch((error) => console.log(error.message));
  };

  return (
    <>
      {teamOwner && (
        <VStack h="84%" alignItems="start" w="70%">
          <HStack key={teamOwner.handle} m="5px 0">
            <Avatar size="sm" src={teamOwner.avatarUrl}>
              <AvatarBadge bg="teal.500">
                {
                  <UserStatusIcon
                    userHandle={teamOwner.handle}
                    iconSize={"5px"}
                  />
                }
              </AvatarBadge>
            </Avatar>
            <Heading
              className="team-member-handle"
              display="inline"
              as="h3"
              size="sm"
              color="white"
            >
              {teamOwner.handle}
            </Heading>
            <Image src="/crown.png" w="28px" h="28px" display="inline" />
            {userData.handle !== teamOwner.handle && (
              <PhoneIcon
                onClick={() => startCall(teamOwner.handle)}
                float="right"
                m="5px"
                cursor="pointer"
                color="green"
                fontSize="23px"
              />
            )}
          </HStack>

          {teamMembers
            .filter((m) => m.handle !== teamOwner.handle)
            .map((member) => (
              <HStack key={member.handle} m="5px 0" w="100%">
                <Avatar size="sm" src={member.avatarUrl}>
                  <AvatarBadge bg="teal.500">
                    {
                      <UserStatusIcon
                        userHandle={member.handle}
                        iconSize={"5px"}
                      />
                    }
                  </AvatarBadge>
                </Avatar>
                <Heading
                  className="team-member-handle"
                  display="inline"
                  as="h3"
                  size="sm"
                  color="white"
                >
                  {member.handle}
                </Heading>
                <Spacer />
                {member.handle !== userData.handle && (
                  <PhoneIcon
                    onClick={() => startCall(member.handle)}
                    float="right"
                    m="5px"
                    cursor="pointer"
                    color="green"
                    fontSize="25px"
                  />
                )}
              </HStack>
            ))}
        </VStack>
      )}
      {token && (
        <div style={{ height: "50vh", width: "auto" }}>
          <SingleCallRoom token={token} leaveCall={leaveCall} />
        </div>
      )}
    </>
  );
};

TeamMembers.propTypes = {
  selectedTeam: PropTypes.object.isRequired,
};

export default TeamMembers;
