import PropTypes from "prop-types";
import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteMeeting } from "@dytesdk/react-web-core";
import { useContext, useEffect } from "react";
import AppContext from "../../providers/AppContext";
import "./MyMeeting.css";

const MyMeeting = ({ leaveCall, isMeeting = false }) => {
  const { meeting } = useDyteMeeting();
  const { userData } = useContext(AppContext);

  useEffect(() => {
    meeting.self.on("roomLeft", () => {
      leaveCall();
    });
  }, [meeting, userData]);

  return (
    <div
      style={{
        height: isMeeting ? "81vh" : "55vh",
        width: isMeeting ? "75vw" : "auto",
        marginLeft: isMeeting ? "28px" : "0px",
      }}
    >
      <DyteMeeting
        mode="fill"
        meeting={meeting}
        showSetupScreen={false}
        className="bg-gray-700"
      />
    </div>
  );
};

MyMeeting.propTypes = {
  leaveCall: PropTypes.func.isRequired,
  isMeeting: PropTypes.bool.isRequired,
};

export default MyMeeting;
