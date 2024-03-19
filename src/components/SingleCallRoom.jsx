import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import { useEffect, useState } from "react";

import MyMeeting from "./MyMeeting";


const SingleCallRoom = ({ token, leaveCall, isMeeting = false }) => {

  const [client, initClient] = useDyteClient();

  useEffect(() => {
    if (token) {
      initClient({
        authToken: token,
        defaults: {
          audio: false,
          video: false
        }
      })
    }
  }, []);

  if (!client) return <div>CONNECTING...</div>;


  return (
    <>
      <div>
        {client ?
          <DyteProvider value={client}>
            <MyMeeting leaveCall={leaveCall} isMeeting={isMeeting}/>
          </DyteProvider>
          : <div style={{ height: '30vh', width: 'auto' }}> </div>
        }
      </div>
    </>
  );
};

export default SingleCallRoom;
