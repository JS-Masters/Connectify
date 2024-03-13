import { Button } from "@chakra-ui/react";
import Popup from "reactjs-popup";
import Sidebar from "../pages/Calendar/CalendarSidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import { createDyteMeeting, createMeetingInDb, getMeetingsByTeamId } from "../services/meeting.services";



const CreateMeetingPopUp = ({ teamName }) => {

  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [teamMeetings, setTeamMeetings] = useState([]);
  const [newMeetingCreated, setNewMeetingCreated] = useState(false);
  const { teamId } = useParams();

  useEffect(() => {
    getMeetingsByTeamId(teamId)
    .then((meetings) => {
      if(meetings) {
        const dateUpdatedMeetings = Object.values(meetings) .map((meeting) => {
          return {...meeting, start: new Date(meeting.start), end: new Date(meeting.end)}
        })

        setTeamMeetings(dateUpdatedMeetings);
      }
    })
  }, [teamId, newMeetingCreated]);


  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible)
  };

  const handlePopUpClose = (close) => {
    close();
  };

  const handleDateSelect = (selectInfo) => {
    let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: v4(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      })
    }
  };

  const handleEvents = (events) => {
    setCurrentEvents(events)
  };

  const createMeeting = (meetingId, title, start, end) => {
    createMeetingInDb(meetingId, title, start, end, teamId)
    .then(() => {
      createDyteMeeting(meetingId, teamId);
      setNewMeetingCreated(!newMeetingCreated)
    })
  };

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        {/* <i>{JSON.stringify(eventInfo.event.start)}</i> */}
        <br />
        {!(teamMeetings.find((meeting) => meeting.id === eventInfo.event.id)) &&
          <button style={{ border: '1px solid black', padding: '3px' }} onClick={() => createMeeting(eventInfo.event.id, eventInfo.event.title, eventInfo.event.start, eventInfo.event.end)}>Create Meeting</button>}
        <button style={{ border: '1px solid black', padding: '3px' }} onClick={() => eventInfo.event.remove()}>Delete</button>
      </>
    );
  };

  return (
    <Popup trigger=
      {<Button style={{ width: '150px', height: '45px', backgroundColor: 'blue', fontSize:'14px' }}>Create/Edit Meeting</Button>}
      modal nested>
      {
        close => (
          <div className='modal'>
            <Button style={{ float: "right", margin: "15px" }} onClick=
              {() => handlePopUpClose(close)}>
              X
            </Button>
            <div style={{ width: '1100px', height: '800px', border: '2px solid black', backgroundColor: 'bisque' }} className='content'>
              <h1 style={{ textAlign: 'center', fontSize: '24px' }}>{teamName}</h1>
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
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    initialEvents={teamMeetings} 
                    select={handleDateSelect}
                    eventContent={renderEventContent}

                    // eventClick={handleEventClick}

                    eventsSet={handleEvents} // called after events are initialized/added/changed/removed
                  /* you can update a remote database when these fire:
                  eventAdd={function(){}}
                  eventChange={function(){}}
                  eventRemove={function(){}}
                  */
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }
    </Popup>
  );
};

export default CreateMeetingPopUp;