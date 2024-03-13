import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import { useEffect, useState } from "react";

import MyMeeting from "./MyMeeting";


const SingleCallRoom = ({ token, leaveCall }) => {

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
      <div className="flex-1 flex flex-col bg-gray-700">
        {client ?
          <DyteProvider value={client}>
            <MyMeeting leaveCall={leaveCall} />
          </DyteProvider>
          : <div style={{ height: '30vh', width: 'auto' }}> </div>
        }
      </div>
    </>
  );
};

export default SingleCallRoom;
