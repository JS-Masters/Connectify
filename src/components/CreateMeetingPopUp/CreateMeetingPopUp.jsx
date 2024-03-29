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

  const handlePopUpClose = (close) => {
    close();
  };

  const handleDateSelect = (selectInfo) => {
    let title = prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
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
        <br />
        {!teamMeetings.find((meeting) => meeting.id === eventInfo.event.id) && (
          <button
          id="create-meeting-button"
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
            Create
          </button>
        )}
        <button
        id="delete-meeting-button"
          style={{ border: "1px solid black", padding: "3px" }}
          onClick={() => handleDeleteMeeting(eventInfo.event)}
        >
          Delete
        </button>
      </>
    );
  };

  return (
    <Popup trigger={<input id="create-meeting-button-teams" value='Meetings Calendar' type="button" />} modal nested
      closeOnDocumentClick={false}
      closeOnEscape={false}>
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
          <Box textAlign='center'>
            <Heading as="h3" m="10px" fontSize='40px'>
              {teamName}
            </Heading>
          </Box>
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
            weekends={false}
            initialEvents={teamMeetings}
            select={handleDateSelect}
            eventContent={renderEventContent}
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
