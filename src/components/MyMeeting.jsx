import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteMeeting } from "@dytesdk/react-web-core";
import { useContext, useEffect } from "react";
import AppContext from "../providers/AppContext";

const MyMeeting = ({ leaveCall }) => {

  const { meeting } = useDyteMeeting();
  const { userData } = useContext(AppContext);

  useEffect(() => {
    meeting.self.on('roomLeft', () => {
      leaveCall();
    });
  }, [meeting, userData]);

  return (
    <div style={{ height: '50vh', width: 'auto' }}>
      <DyteMeeting
        mode='fill'
        meeting={meeting}
        showSetupScreen={false}
        className="bg-gray-700"
      />
    </div>
  );
};

export default MyMeeting;