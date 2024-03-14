import { get, push, ref, set, remove, query, onValue, limitToFirst, update } from "@firebase/database";
import { db } from "../config/firebase-config";
import { updateUserByHandle } from "./user.services";
import { DATABASE_ERROR_MSG } from "../common/constants";
import { removeTeamMeetingsFromUser } from "./meeting.services";

export const getTeamMembers = async (teamId) => {
  try {
    const teamMembersRef = await get(ref(db, `teams/${teamId}/members`));

    if (!teamMembersRef.exists()) {
      throw new Error('There was problem with retrieving team members from database');
    }
    const teamMembers = teamMembersRef.val();
    return teamMembers;

  } catch (error) {
    console.log(error.message);
  }
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
  }
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
  }
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
  }
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
  }
};

export const getTeamById = async (teamId) => {
  try {
    const teamSnapshot = await get(ref(db, `teams/${teamId}`));
    if (!teamSnapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    return teamSnapshot.val();

  } catch (error) {
    console.log(error.message);
  }
};

export const leaveTeam = async (teamId, userToRemove) => {
  try {
    await remove(ref(db, `teams/${teamId}/members/${userToRemove}`));
    await remove(ref(db, `users/${userToRemove}/teams/${teamId}`));

    const teamMembers = await getTeamMembers(teamId);
    const removeMemberInOtherUsersPromises = Object.keys(teamMembers).map(async (member) => await removeTeamMemberInUser(member, teamId, userToRemove));

    await Promise.all(removeMemberInOtherUsersPromises);
    await removeTeamMeetingsFromUser(userToRemove, teamId);
  } catch (error) {
    console.log(error.message);
  }
};

export const removeTeamMemberInUser = async (userHandle, teamId, userToRemove) => {
  try {
    await remove(ref(db, `users/${userHandle}/teams/${teamId}/members/${userToRemove}`));
  } catch (error) {
    console.log(error.message);
  }
};

export const listenForTeamsByUserHandle = (listenFn, loggedUserHandle) => {
  const q = query(
    ref(db, `users/${loggedUserHandle}/teams`),
    // orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
};

export const addNewMemberToTeam = async (teamId, newMemberHandle) => {
  try {
    const teamMembers = await getTeamMembers(teamId);
    const teamMembersUpdated = { ...teamMembers, [newMemberHandle]: true };
    await update(ref(db, `teams/${teamId}/members`), teamMembersUpdated);

    const newMemberTeams = await getTeamsByUserHandle(newMemberHandle);
    const team = await getTeamNameByTeamId(teamId);
    await updateUserByHandle(newMemberHandle, 'teams', { ...newMemberTeams, [teamId]: { members: teamMembersUpdated, teamName: team.teamName, id: teamId } });

    const updateEachOldMemberTeamPromises = Object.keys(teamMembersUpdated).map(async (memberHandle) => await update(ref(db, `users/${memberHandle}/teams/${teamId}/members`), teamMembersUpdated))
    await Promise.all(updateEachOldMemberTeamPromises);
  } catch (error) {
    console.log(error.message);
  }
};

export const getTeamNameByTeamId = async (teamId) => {
  try {
    const teamSnapshot = await get(ref(db, `teams/${teamId}`));
    if (!teamSnapshot.exists()) {
      throw new Error(DATABASE_ERROR_MSG);
    }
    return teamSnapshot.val();
  } catch (error) {
    console.log(error.message);
  }
};

export const listenForNewTeamMember = (listenFn, teamId) => {
  const q = query(
    ref(db, `teams/${teamId}/members`),
    // orderByChild('createdOn'),
    limitToFirst(50)
  )
  return onValue(q, listenFn);
}


