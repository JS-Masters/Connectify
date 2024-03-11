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

const Calendar = () => {

  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [currentEvents, setCurrentEvents] = useState([])

  const { user, userData } = useContext(AppContext);
  const [meetings, setMeetings] = useState([]);
  const [meetingToken, setMeetingToken] = useState('');

  useEffect(() => {
    if (userData) {
      getMeetingsByUserHandle(userData.handle)
        .then((meetings) => {
          setMeetings(meetings)
        })
    }

    // listen for meetings in users/userData.handle/meetings !!! listenForMeetingsByUserHandle !!!

  }, [user]) // [] или [userData/user] ???


  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible)
  };

  const handleEvents = (events) => {
    setCurrentEvents(events)
  };

  const handleJoinMeeting = (dyteRoomId) => {
    joinMeeting(dyteRoomId, userData, (data) => setMeetingToken(data));
  }
  const leaveMeeting = () => {
    setMeetingToken('');
  }


  const renderEventContent = (eventInfo) => {
    console.log();
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
      {meetings.length > 0 &&
        <div > {/* we can add styles to this div (change calendar size for example !!!) */}
          <div className='demo-app'>
            <Sidebar
              weekendsVisible={weekendsVisible}
              handleWeekendsToggle={handleWeekendsToggle}
              currentEvents={currentEvents}
            />
            <div className='demo-app-main'>
              <FullCalendar
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
              /* you can update a remote database when these fire:
              eventAdd={function(){}}
              eventChange={function(){}}
              eventRemove={function(){}}
              */
              />
            </div>
          </div>
        </div>}
      {meetingToken &&
        <div style={{ height: '50vh', width: 'auto' }} >
          <SingleCallRoom token={meetingToken} leaveCall={leaveMeeting} />
        </div>}
    </>


  );
};

export default Calendar;





