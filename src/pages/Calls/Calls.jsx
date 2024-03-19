import { Avatar, AvatarBadge, Box, Button, Heading, Input, Text, useToast, Image, ListItem, List, Flex, HStack, Spacer } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { changeUserCurrentStatusInDb, checkUsersIfBannedLoggedUser, getAllUsers, getUserLastStatusByHandle, getUserStatusByHandle } from "../../services/user.services";
import { addIncomingCallToDb, createCall, endCall, getCallsByUserHandle } from "../../services/call.services";
import { useContext } from "react";
import AppContext from "../../providers/AppContext";
import { addUserToCall, createDyteCall } from "../../services/dyte.services";
import SingleCallRoom from "../../components/SingleCallRoom";
import { v4 } from "uuid";
import UserStatusIcon from "../../components/UserStatusIconChats";
import { statuses } from "../../common/constants";
import "./Calls.css";
import { PhoneIcon } from "@chakra-ui/icons";

const Calls = () => {

  const { userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [calls, setCalls] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersBySearchTerm, setUsersBySearchTerm] = useState([]);
  const [token, setToken] = useState('');
  const [userToCall, setUserToCall] = useState('');
  const [joinedCallDyteId, setJoinedCallDyteId] = useState('');
  const toast = useToast();

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

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users).map(user => ({ ...users[user] }))));
  }, []);

  useEffect(() => {
    if (userData) {
      getCallsByUserHandle(userData.handle)
        .then((loggedUserCalls) => {
          if (loggedUserCalls) {
            setCalls(Object.values(loggedUserCalls));
          }
        })
    }
  }, [])

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length) {
      const filteredUsers = users.filter((u) => u.handle.toLowerCase().startsWith(event.target.value) && u.handle !== userData.handle);
      checkUsersIfBannedLoggedUser(filteredUsers, userData.handle)
        .then(setUsersBySearchTerm)
    } else {
      setUsersBySearchTerm([]);
    };
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
            setSearchTerm('');
            setUsersBySearchTerm([]);
            setUserToCall(userToCallHandle);
            setJoinedCallDyteId(roomID);
          });
      }
    } catch (error) {
      console.log(error.message);
    };
  };

  const leaveCall = () => {

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
    <Flex justifyContent='center'>
      <Box w='70%'>
        <Input id="calls-input" value={searchTerm} onChange={handleInputChange} placeholder="Connect with..." />
        <Box  size='md' key={v4()} >

          <List
            id="calls-search-users-list"
            overflow="hidden"
            overflowY="auto"
            position='absolute'
            style={{ border: '2px solid black', borderRadius: '10px', maxHeight: '275px', padding: '2px' }}
          >
            {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) => (
              <ListItem
                className="calls-form-user"
                key={v4()}
                style={{ cursor: "pointer", border: '1px solid transparent', borderRadius: '5px', padding: '2px' }}
              >
                <Avatar size='sm' src={user.avatarUrl}>
                  <AvatarBadge bg="teal.500">{<UserStatusIcon userHandle={user.handle} iconSize={'5px'} />}</AvatarBadge>
                </Avatar>
                <Heading display='inline' as='h3' size='sm'>{user.handle}</Heading>
                <Button style={{ float: 'right', color: 'blue' }} onClick={() => startCall(user.handle)}>CALL {user.handle}</Button>
              </ListItem>
            ))}
          </List>

          {/* {Boolean(usersBySearchTerm.length) && usersBySearchTerm.map((user) =>

        
          <div key={v4()} style={{ marginBottom: '25px' }}>
            <Avatar size='sm' src={user.avatarUrl}>
              <AvatarBadge bg="teal.500">{<UserStatusIcon userHandle={user.handle} iconSize={'5px'} />}</AvatarBadge>
            </Avatar>
            <Heading display='inline' as='h3' size='sm'>{user.handle}</Heading>
            <Button style={{ float: 'right', color: 'blue' }} onClick={() => startCall(user.handle)}>CALL {user.handle}</Button>
          </div>
        )} */}
        </Box >
        {
          calls ? (
            calls.map((call) => {
              return call.incoming ? (
                <HStack key={v4()} justifyContent='space-between'>
                  <Avatar size='md' src={call.madeCallAvatar}>
                    <AvatarBadge bg="teal.500">
                      {<UserStatusIcon userHandle={call.madeCall} iconSize={'15px'} />}
                    </AvatarBadge>
                  </Avatar>
                  <Heading style={{ color: 'white', paddingLeft:'10px' }}> {call.madeCall}</Heading>
                  <Spacer/>
                  <Text fontSize='15px' color='#2E5E17'>Incoming Call </Text>
                  <Heading fontSize='25px' style={{ color: 'white', marginLeft:'15px' }}>{call.createdOn}</Heading>
                  <PhoneIcon
                    onClick={() => startCall(call.recievedCall)}
                    float="right"
                    m="10px"
                    ml='25px'
                    cursor="pointer"
                    color="green"
                    fontSize="40px"
                  />
                </HStack>
              ) : (
                <HStack key={v4()} justifyContent='space-between' m='20px' marginTop='30px'>
                  <Avatar size='md' src={call.recievedCallAvatar}>
                    <AvatarBadge bg="teal.500">
                      {<UserStatusIcon userHandle={call.recievedCall} iconSize={'15px'} />}
                    </AvatarBadge>
                  </Avatar>
                  <Heading style={{ color: 'white', paddingLeft:'10px' }}> {call.recievedCall}</Heading>
                  <Spacer/>
                  <Text fontSize='15px' color='#FFBD0A'>Outgoing Call </Text>
                  <Heading fontSize='25px' style={{ color: 'white', marginLeft:'15px' }}>{call.createdOn}</Heading>
                  <PhoneIcon
                    onClick={() => startCall(call.recievedCall)}
                    float="right"
                    m="10px"
                    ml='25px'
                    cursor="pointer"
                    color="green"
                    fontSize="40px"
                  />
                  {/* <Image id='outgoing-call-img' style={{ width: '52px', height: '52px', padding: '4px', display: 'inline', marginLeft:'20px' }} src="../../outgoing-call.png" /> */}
                </HStack>
              );
            })
          ) : (
            <Heading>You have no calls made yet...</Heading>
          )}

        {token && <div style={{ height: '50vh', width: 'auto' }}><SingleCallRoom token={token} leaveCall={leaveCall} /></div>}
      </Box>
    </Flex>
  );
};

export default Calls;