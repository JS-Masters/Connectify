import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteMeeting } from "@dytesdk/react-web-core";
import { useContext, useEffect } from "react";
import { changeUserCurrentStatusInDb, getUserLastStatusByHandle } from "../services/user.services";
import AppContext from "../providers/AppContext";

const MyMeeting = ({ leaveCall }) => {

  const { meeting } = useDyteMeeting();
  const { userData } = useContext(AppContext);

  useEffect(() => {
    meeting.self.on('roomLeft', () => {
      leaveCall();
      getUserLastStatusByHandle(userData.handle)
        .then((previousStatus) => {
          changeUserCurrentStatusInDb(userData.handle, previousStatus)
        })
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