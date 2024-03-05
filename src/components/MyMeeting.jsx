import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteMeeting } from "@dytesdk/react-web-core";
import { useEffect } from "react";

const MyMeeting = ({ leaveCall }) => {

  const { meeting } = useDyteMeeting();

  useEffect(() => {
    meeting.self.on('roomLeft', () => {
      leaveCall();
      // променяме статуса, че вече не е In a meeting
    });
  }, [meeting]);

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