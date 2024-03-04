import { DyteProvider, useDyteClient } from "@dytesdk/react-web-core";
import { useEffect } from "react";

import MyMeeting from "./MyMeeting";


const SingleCallRoom = ({ token }) => {

  const [client, initClient] = useDyteClient();

  useEffect(() => {
    if (token) {
      initClient({
        authToken: token,
        defaults: {
          audio: false,
          video: false
        }
      });
    }
  }, []);

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-700">
        {client ?
          <DyteProvider value={client}>
            <MyMeeting />
          </DyteProvider>
          : <div style={{ height: '30vh', width: 'auto' }}> </div>
        }
      </div>
    </>
  );
};

export default SingleCallRoom;
