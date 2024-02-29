import { get, push, ref, set } from "@firebase/database";
import { db } from "../config/firebase-config";
import { updateUserByHandle } from "./user.services";

export const getTeamMembers = async (teamId) => {
    try {
        const teamMembersRef = await get(ref(db, `teams/${teamId}/members`));
        
        if (!teamMembersRef.exists()) {
            throw new Error('There was problem with retrieving team members from database');
            // return null; ???????     
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
}

const updateUsersTeams = async (teamMembers, newTeamId) => {
try{
    const teamPromises = Object.keys(teamMembers).map(async (member) => {
        const memberTeams = await getTeamsByUserHandle(member);
        return { member, teams: memberTeams };
      });

      const allTeams = await Promise.all(teamPromises);

      const updatePromises = allTeams.map(async ({ member, teams }) => {
        await updateUserByHandle(member, 'teams', { ...teams, [newTeamId]: {members : teamMembers} });
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

        await updateUsersTeams(allMembers, teamRef.key);
        return teamRef.key;

    } catch (error) {
        console.log(error.message);
    }
};

export const addChannelToTeam = async (teamId, channelTitle, createdBy) => {
    try {      
        const teamMembers = await getTeamMembers(teamId);
        const channelRef = await push(ref(db, `teams/${teamId}/channels`), {});
        await set(ref(db, `teams/${teamId}/channels/${channelRef.key}`), {
            id: channelRef.key,
            title: channelTitle,
            createdOn: new Date().toLocaleDateString(),
            createdBy,
            participants: teamMembers
        })
    } catch (error) {
        console.log(error.message);
    }
};