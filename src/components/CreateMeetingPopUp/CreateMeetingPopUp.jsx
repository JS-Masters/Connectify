import PropTypes from "prop-types";
import { Box, Button, Heading } from "@chakra-ui/react";
import Popup from "reactjs-popup";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 } from "uuid";
import {
  createDyteMeeting,
  createMeetingInDb,
  deleteMeeting,
  getMeetingsByTeamId,
} from "../../services/meeting.services";
import "./CreateMeetingPopUp.css";

const CreateMeetingPopUp = ({ teamName }) => {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [teamMeetings, setTeamMeetings] = useState([]);
  const [newMeetingCreated, setNewMeetingCreated] = useState(false);
  const { teamId } = useParams();

  useEffect(() => {
    getMeetingsByTeamId(teamId).then((meetings) => {
      if (meetings) {
        const dateUpdatedMeetings = Object.values(meetings).map((meeting) => {
          return {
            ...meeting,
            start: new Date(meeting.start),
            end: new Date(meeting.end),
          };
        });

        setTeamMeetings(dateUpdatedMeetings);
      }
    });
  }, [teamId, newMeetingCreated]);

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  const handlePopUpClose = (close) => {
    close();
  };

  const handleDateSelect = (selectInfo) => {
    let title = prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: v4(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };

  const handleEvents = (events) => {
    setCurrentEvents(events);
  };

  const createMeeting = (meetingId, title, start, end) => {
    createMeetingInDb(meetingId, title, start, end, teamId).then(() => {
      createDyteMeeting(meetingId, teamId);
      setNewMeetingCreated(!newMeetingCreated);
    });
  };

  const handleDeleteMeeting = (event) => {
    event.remove();
    deleteMeeting(event.id, teamId);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
        {/* <i>{JSON.stringify(eventInfo.event.start)}</i> */}
        <br />
        {!teamMeetings.find((meeting) => meeting.id === eventInfo.event.id) && (
          <button
            style={{ border: "1px solid black", padding: "3px" }}
            onClick={() =>
              createMeeting(
                eventInfo.event.id,
                eventInfo.event.title,
                eventInfo.event.start,
                eventInfo.event.end
              )
            }
          >
            Create Meeting
          </button>
        )}
        <button
          style={{ border: "1px solid black", padding: "3px" }}
          onClick={() => handleDeleteMeeting(eventInfo.event)}
        >
          Delete
        </button>
      </>
    );
  };

  return (
    <Popup trigger={<Button mb="20px">Meetings Calendar</Button>} modal nested>
      {(close) => (
        <Box id="pop-up-calendar" minW="1000px">
          <Button
            float="right"
            colorScheme="transparent"
            color="red"
            onClick={() => handlePopUpClose(close)}
          >
            X
          </Button>

          <Heading as="h3" m="10px" color="cyan">
            {teamName}
          </Heading>
          <FullCalendar
            height="650px"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="timeGridWeek"
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
        </Box>
      )}
    </Popup>
  );
};

CreateMeetingPopUp.propTypes = {
  teamName: PropTypes.string.isRequired,
};

export default CreateMeetingPopUp;
