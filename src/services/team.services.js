import { get, push, ref, set } from "@firebase/database";
import { db } from "../config/firebase-config";
import { updateUserByHandle } from "./user.services";
import { DATABASE_ERROR_MSG } from "../common/constants";

export const getTeamMembers = async (teamId) => {
  try {
    const teamMembersRef = await get(ref(db, `teams/${teamId}/members`));

    if (!teamMembersRef.exists()) {
      throw new Error('There was problem with retrieving team members from database');  
    };
    const teamMembers = teamMembersRef.val();
    return teamMembers;

  } catch (error) {
    console.log(error.message);
  };
};

export const getTeamsByUserHandle = async (userHandle) => {
  try {
    const teamsSnapshot = await get(ref(db, `users/${userHandle}/teams`));
    if (!teamsSnapshot.exists()) {
      return null;
    }
    return teamsSnapshot.val();

  } catch (error) {
    console.log(error.message);
  };
};

const updateUsersTeams = async (teamMembers, newTeamId, teamName) => {
  try {
    const teamPromises = Object.keys(teamMembers).map(async (memberHandle) => {
      const memberTeams = await getTeamsByUserHandle(memberHandle);
      return { memberHandle, teams: memberTeams };
    });
    const allTeams = await Promise.all(teamPromises);

    const updatePromises = allTeams.map(async ({ memberHandle, teams }) => {
      await updateUserByHandle(memberHandle, 'teams', { ...teams, [newTeamId]: { members: teamMembers, teamName: teamName, id: newTeamId } });
    });
    await Promise.all(updatePromises);

  } catch (error) {
    console.log(error.message);
  };
};

export const createTeam = async (teamName, teamOwner, teamMembers) => {
  try {
    let allMembers = { [teamOwner]: true };
    teamMembers.map((member) => {
      allMembers = { ...allMembers, [member]: true }
    });

    const teamRef = await push(ref(db, 'teams'), {});
    await set(ref(db, `teams/${teamRef.key}`), {
      id: teamRef.key,
      teamName,
      owner: teamOwner,
      members: allMembers,
      createdOn: new Date().toLocaleString()
    })
  
    await updateUsersTeams(allMembers, teamRef.key, teamName);
    return teamRef.key;

  } catch (error) {
    console.log(error.message);
  };
};

export const getTeamsByIds = async (teamIds) => {
  try {
    const teamPromises = teamIds.map((teamId) => {
      return get(ref(db, `teams/${teamId}`));
    });
    const teamSnapshots = await Promise.all(teamPromises);

    const teams = teamSnapshots.map((teamSnapshot) => {
      if (!teamSnapshot.exists()) {
        throw new Error(DATABASE_ERROR_MSG);
      }
      return teamSnapshot.val();
    });
    return teams;
  } catch (error) {
    console.log(error.message);
  };
};

