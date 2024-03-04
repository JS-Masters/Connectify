import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteMeeting } from "@dytesdk/react-web-core";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useLocation } from "react-router-dom";

const MyMeeting = ({ setToken }) => {

  const { meeting } = useDyteMeeting();

  useEffect(() => {
    meeting.self.on('roomLeft', () => {
      setToken('');
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