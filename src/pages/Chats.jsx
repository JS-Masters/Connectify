import { useToast } from "@chakra-ui/toast";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppContext from "../providers/AppContext";
import { getAllUsers } from "../services/user.services";
import { getChatsByUserHandle } from "../services/chat.services";
import SelectedUsersBar from "../components/SelectedUsersBar/SelectedUsersBar";
import { v4 } from "uuid";

const Chats = () => {
  const { userData } = useContext(AppContext);
  const toast = useToast();
  const navigate = useNavigate();
  const [myChats, setMyChats] = useState(null);

  const [users, setUsers] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const setSearch = (value) => {
    setSearchParams({ search: value });
  };

  useEffect(() => {
    getAllUsers().then((users) => setUsers(Object.keys(users)));

    getChatsByUserHandle(userData.handle).then((chats) => {
      if (chats) {
        setMyChats(chats);
      }
    });
  }, []);

  useEffect(() => {
    if (users.length) {
      const usersFiltered = users.filter(
        (u) =>
          u.toLowerCase().includes(search.toLowerCase()) &&
          u !== userData.handle
      );
      setFoundUsers(usersFiltered);
    }
  }, [search, users, userData.handle]);

  const updateSelectedUsersPreferences = (userHandle) => {
    if (selectedUsers.includes(userHandle)) {
      const selectedUsersUpdated = selectedUsers.filter(
        (u) => u !== userHandle
      );
      setSelectedUsers(selectedUsersUpdated);
    } else {
      setSelectedUsers([...selectedUsers, userHandle]);
    }
  };

  return (
    <>
      <SelectedUsersBar
        foundUsers={foundUsers}
        selectedUsers={selectedUsers}
        setSearch={setSearch}
        updateSelectedUsersPreferences={updateSelectedUsersPreferences}
      />
      <div>
        {myChats ? (
          Object.keys(myChats).map((chatId) => {
            const chatName = myChats[chatId].join(", ");
            return (
              <h1 key={v4()} onClick={() => navigate(`/chats/${chatId}`)}>
                {chatName}
              </h1>
            );
          })
        ) : (
          <h1>You dont have any chats yet...</h1>
        )}
      </div>
    </>
  );
};

export default Chats;
