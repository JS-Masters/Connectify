import React, { useContext, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Sidebar from './CalendarSidebar'
import './Calendar.css';
import AppContext from '../../providers/AppContext'
import { getMeetingsByUserHandle, joinMeeting, listenForMeetingsByUserHandle } from '../../services/meeting.services'
import SingleCallRoom from '../../components/SingleCallRoom'
import { changeUserCurrentStatusInDb, getUserLastStatusByHandle } from '../../services/user.services'
import { Box } from '@chakra-ui/react'
// import enLocale from '@fullcalendar/core/locales/en';

const Calendar = () => {

  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [currentEvents, setCurrentEvents] = useState([])

  const { user, userData } = useContext(AppContext);
  const [meetings, setMeetings] = useState([]);
  const [meetingToken, setMeetingToken] = useState('');
  const [userHasNoTeams, setUserHasNoTeams] = useState(false);

  useEffect(() => {
    if (userData) {
      getMeetingsByUserHandle(userData.handle)
        .then((meetings) => {
          if (meetings.length > 0) {
            setMeetings(meetings);
          } else {
            setUserHasNoTeams(true);
          }
        })
    }
  }, [user]);

  // useEffect(() => {
  //   if (userData) {
  //     const unsubscribe = listenForMeetingsByUserHandle(((snapshot) => {
  //       if(snapshot.exists()){
  //         console.log(snapshot.val());
  //         getMeetingsByUserHandle(userData.handle)
  //         .then((meetings) => {
  //           if(meetings && meetings.length > 0) {
  //             setMeetings(meetings);
  //           }else {
  //             setUserHasNoTeams(true);
  //           }    
  //         })
  //       }
  //     }), userData.handle);   
  //     return () => unsubscribe();
  //   };
  // }, [userData]) 


  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible)
  };

  const handleEvents = (events) => {
    setCurrentEvents(events)
  };

  const handleJoinMeeting = (dyteRoomId) => {
    joinMeeting(dyteRoomId, userData, (data) => setMeetingToken(data));
  };

  const leaveMeeting = () => {
    getUserLastStatusByHandle(userData.handle)
      .then((previousStatus) => {
        changeUserCurrentStatusInDb(userData.handle, previousStatus)
      })
      .then(() => {
        setMeetingToken('');
      })
      .catch((error) => console.log(error.message))
  };


  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        <button onClick={() => handleJoinMeeting(eventInfo.event.extendedProps.dyteMeetingId)}>JOIN</button>
      </>
    );
  };

  return (
    <>
      {(meetings.length > 0 || userHasNoTeams) &&
        <Box id='calendar-main-box' w='89%'>
          <Sidebar
            weekendsVisible={weekendsVisible}
            handleWeekendsToggle={handleWeekendsToggle}
            currentEvents={currentEvents}
          />
          <div id='calendar-box' className='demo-app-main'>
            <FullCalendar
              height='100%'
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}   
              initialView='timeGridWeek'
            
              editable={false}
              selectable={false}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={weekendsVisible}
              initialEvents={meetings}
              eventContent={renderEventContent}
              eventsSet={handleEvents} // called after events are initialized/added/changed/removed
            />
          </div>

        </Box>}
      {meetingToken &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={meetingToken} leaveCall={leaveMeeting} />
        </div>}
    </>
  );
};

export default Calendar;





