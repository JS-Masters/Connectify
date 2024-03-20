import PropTypes from "prop-types";
import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import { useEffect } from "react";

import MyMeeting from "./MyMeeting/MyMeeting";

const SingleCallRoom = ({ token, leaveCall, isMeeting = false }) => {
  const [client, initClient] = useDyteClient();

  useEffect(() => {
    if (token) {
      initClient({
        authToken: token,
        defaults: {
          audio: false,
          video: false,
        },
      });
    }
  }, []);

  if (!client) return <div>CONNECTING...</div>;

  return (
    <>
      {client ? (
        <DyteProvider value={client}>
          <MyMeeting leaveCall={leaveCall} isMeeting={isMeeting} />
        </DyteProvider>
      ) : (
        <div style={{ height: "30vh", width: "auto" }}> </div>
      )}
    </>
  );
};

SingleCallRoom.propTypes = {
  token: PropTypes.string.isRequired,
  leaveCall: PropTypes.func.isRequired,
  isMeeting: PropTypes.bool,
};

export default SingleCallRoom;
