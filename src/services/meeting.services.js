import { get, onValue, query, ref, set, update } from "firebase/database";
import { DYTE_URL, statuses } from "../common/constants";
import { DYTE_KEY } from "../common/dyte.api.auth";
import { db } from "../config/firebase-config";
import { getTeamMembers, getTeamsByUserHandle } from "./team.services";
import { changeUserCurrentStatusInDb, updateUserByHandle } from "./user.services";


export const listenForMeetingsByUserHandle = (listenFn, userHandle) => {
  const q = query(
    ref(db, `users/${userHandle}/meetings`)
  )
  return onValue(q, listenFn);
};

export const getMeetingsByUserHandle = async (userHandle) => {
  try {
    const userTeams = await getTeamsByUserHandle(userHandle);
    if (userTeams) {
      const userTeamsIds = Object.keys(userTeams);

      const meetingPromises = userTeamsIds.map(async (teamId) => {
        const meetings = await getMeetingsByTeamId(teamId)
        if (meetings) {
          const dateUpdatedMeetings = Object.values(meetings).map((meeting) => {
            return { ...meeting, start: new Date(meeting.start), end: new Date(meeting.end) }
          });
          return dateUpdatedMeetings;
        }
        return [];
      });

      const allMeetings = await Promise.all(meetingPromises);
      return allMeetings.flat();
    }
    return [];
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


export const updateUsersMeetings = async (teamMembers, dyteMeetingId, teamId) => {
  try {
    const meetingPromises = teamMembers.map(async (member) => {
      const memberMeetingsIds = await getMeetingsIdsByUserHandle(member);
      return { member, meetings: memberMeetingsIds };
    });

    const allMeetings = await Promise.all(meetingPromises);

    const updatePromises = allMeetings.map(async ({ member, meetings }) => {
      await updateUserByHandle(member, 'meetings', { ...meetings, [dyteMeetingId]: teamId });
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

    const teamMembers = await getTeamMembers(teamId);
    await updateUsersMeetings(Object.keys(teamMembers), dbMeetingId, teamId);



    return result.data.id;
  } catch (error) {
    console.log(error.message);
  }
};

export const removeTeamMeetingsFromUser = async (userHandle, teamId) => {
  try {
    const userMeetingsSnapshot = await get(ref(db, `users/${userHandle}/meetings`));
    if (userMeetingsSnapshot.exists()) {
      const userMeetings = userMeetingsSnapshot.val();
      const userMeetingsEntries = Object.entries(userMeetings);
      if (userMeetingsEntries.length > 0) {
        const userMeetingsUpdatedEntries = userMeetingsEntries.filter((m) => m[1] !== teamId);
        const userMeetingsUpdated = Object.fromEntries(userMeetingsUpdatedEntries);

        await set(ref(db, `users/${userHandle}/meetings`), userMeetingsUpdated);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const joinMeeting = (dyteRoomId, userData, listenFn) => {
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
    .then(() => changeUserCurrentStatusInDb(userData.handle, statuses.inMeeting))
    .catch(e => console.error(e));
};