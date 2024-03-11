
import { ref, update } from "firebase/database";
import { DYTE_URL } from "../common/constants";
import { db } from "../config/firebase-config";
import { DYTE_KEY } from "../common/dyte.api.auth";

export const addDyteRoomIdToCall = async (dbCallId, dyteRoomId) => {
  await update(ref(db, `calls/${dbCallId}`), {
    dyteRoomId: dyteRoomId
  });
  return dyteRoomId; // май може да се махне !
};

export const createDyteCall = async (dbCallId) => {

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${DYTE_KEY}`
    },
    body: `{"title":"CONNECTED NOW","preferred_region":"ap-south-1","record_on_start":false,"live_stream_on_start":false,"recording_config":{"max_seconds":60,"file_name_prefix":"string","video_config":{"codec":"H264","width":1280,"height":720,"watermark":{"url":"http://example.com","size":{"width":1,"height":1},"position":"left top"}},"audio_config":{"codec":"AAC","channel":"stereo"},"storage_config":{"type":"aws","access_key":"string","secret":"string","bucket":"string","region":"us-east-1","path":"string","auth_method":"KEY","username":"string","password":"string","host":"string","port":0,"private_key":"string"},"dyte_bucket_config":{"enabled":true},"live_streaming_config":{"rtmp_url":"rtmp://a.rtmp.youtube.com/live2"}}}`
  };
  try {
    const response = await fetch(`${DYTE_URL}/meetings`, options);
    const result = await response.json();

    await addDyteRoomIdToCall(dbCallId, result.data.id);

    return result.data.id;
  } catch (error) {
    console.log(error.message);
  }
};

export const addUserToCall = (listenFn, userData, dyteRoomId) => {

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${DYTE_KEY}`
    },
    body:
      `{
            "name":"${userData.handle}",
            "preset_name":"Connectify_Preset",
            "custom_participant_id":"${userData.uid}"
            }`
  };

  fetch(`${DYTE_URL}/meetings/${dyteRoomId}/participants`, options)
    .then(response => response.json())
    .then(response => listenFn(response.data.token))
    .catch(e => console.error(e));
  return dyteRoomId;
};