import { useState, useEffect } from 'react';
import { Box, Heading, Spacer, Text } from '@chakra-ui/react';
import CountUp from 'react-countup';
import { fetchAllUsers } from '../../services/user.services';
import './Home.css';

const Home = () => {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    fetchAllUsers().then((users) => setUsers(users));
  }
  , [users]);


  const userCount = users ? Object.keys(users).length : 0;

  return (
    <Box className="home-box"  >

      <Heading id="header-home" as="h1" >
       Welcome to Connectify 
      </Heading>
      <Text id="content-home" as="h2" >
      Here, you'll find everything you need to stay connected with your friends and loved ones.
      <Spacer />
      From talk about everything to planning hangouts, our platform makes communication easy and fun. 
      <Spacer />
      Dive into conversations, express yourself with a wide range of emojis and GIFs, and enjoy the experience of staying in touch with those who matter most.
    <br/>
    <br/>
    <br/>
      <CountUp end={userCount} /> users are already using Connectify. 
        </Text>
      </Box>

  );
}

export default Home;