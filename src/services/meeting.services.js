import { get, onValue, push, query, ref, set, update } from "firebase/database";
import { DYTE_URL } from "../common/constants";
import { DYTE_KEY } from "../common/dyte.api.auth";
import { db } from "../config/firebase-config";
import { getTeamMembers, getTeamsByUserHandle } from "./team.services";
import { updateUserByHandle } from "./user.services";


export const listenForMeetingsByUserHandle = (listenFn, userHandle) => {
  const q = query(
    ref(db, `users/${userHandle}/meetings`)
  )
  return onValue(q, listenFn);
};

export const getMeetingsByUserHandle = async (userHandle) => {
  try {
    const userTeams = await getTeamsByUserHandle(userHandle);
    // за LEAVE трябва тука един if(userTeams) да wrap-ва всичко надолу !!!!
    const userTeamsIds = Object.keys(userTeams);

    const meetingPromises = userTeamsIds.map(async (teamId) => {
     const meetings = await getMeetingsByTeamId(teamId)
  
          if (meetings) {
            const dateUpdatedMeetings = Object.values(meetings).map((meeting) => {
              return { ...meeting, start: new Date(meeting.start), end: new Date(meeting.end) }
            });    
            return dateUpdatedMeetings;
          }   
    });

    const allMeetings = await Promise.all(meetingPromises);
    return allMeetings.flat();

  } catch (error) {
    console.log(error.message);
  }
};

export const getMeetingsByTeamId = async (teamId) => {
  try {
    const meetingsSnapshot = await get(ref(db, `teams/${teamId}/meetings`));
    if (!meetingsSnapshot.exists()) {
      return null;
    }
    return meetingsSnapshot.val();

  } catch (error) {
    console.log(error.message);
  }
};

export const getMeetingsIdsByUserHandle = async (handle) => {
  try {
    const meetingsSnapshot = await get(ref(db, `users/${handle}/meetings`));
    if (!meetingsSnapshot.exists()) {
      return null;
    }
    return meetingsSnapshot.val();

  } catch (error) {
    console.log(error.message);
  }
};


export const updateUsersMeetings = async (teamMembers, meetingId) => {
  try {
    const meetingPromises = teamMembers.map(async (member) => {
      const memberMeetingsIds = await getMeetingsIdsByUserHandle(member);
      return { member, meetings: memberMeetingsIds };
    });

    const allMeetings = await Promise.all(meetingPromises);

    const updatePromises = allMeetings.map(async ({ member, meetings }) => {
      await updateUserByHandle(member, 'meetings', { ...meetings, [meetingId]: true });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.log(error.message);
  }
};


export const addDyteRoomIdToMeeting = async (meetingId, dyteMeetingId, teamId) => {
  await update(ref(db, `teams/${teamId}/meetings/${meetingId}`), {
    dyteMeetingId: dyteMeetingId
  });
};

export const createMeetingInDb = async (meetingId, title, start, end, teamId) => {
  try {
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    await set(ref(db, `teams/${teamId}/meetings/${meetingId}`), {
      id: meetingId,
      title: title,
      start: startTimestamp,
      end: endTimestamp
    });
    const teamMembers = await getTeamMembers(teamId);
    await updateUsersMeetings(Object.keys(teamMembers), meetingId);

  } catch (error) {
    console.log(error.message);
  }
};


export const createDyteMeeting = async (dbMeetingId, teamId) => {

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

    await addDyteRoomIdToMeeting(dbMeetingId, result.data.id, teamId);

    return result.data.id;
  } catch (error) {
    console.log(error.message);
  }
};