import PropTypes from "prop-types";
import { AddIcon, CloseIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { Button, IconButton, List, Tag, useToast } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { v4 } from "uuid";
import "./SelectedUsersBar.css";
import AppContext from "../../providers/AppContext";
import { createNewChat } from "../../services/chat.services";
import { useNavigate } from "react-router";

const SelectedUsersBar = ({
  foundUsers = [],
  selectedUsers = [],
  setSearch = () => {},
  updateSelectedUsersPreferences = () => {},
}) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const [showBar, setShowBar] = useState(false);
  const [searchField, setSearchField] = useState("");

  const showToast = (desc, status) => {
    toast({
      title: "Create New Chat",
      description: desc,
      duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  const updateSearchField = (event) => {
    setSearchField(event.target.value);
    setSearch(event.target.value);
  };

  const formattedSelection =
    selectedUsers.length > 0 ? selectedUsers.join(", ") : "";

  const menu = () => {
    return (
      <div className="drop-down-menu">
        <input
          type="search"
          value={searchField}
          onChange={updateSearchField}
          placeholder="Connect with..."
        />
        <div className="selected-content" style={{ color: "black" }}>
          {selectedUsers.join(" ").length
            ? selectedUsers.map((user) => (
                <Tag
                  key={v4()}
                  onClick={() => updateSelectedUsersPreferences(user)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "darkgray",
                    color: "black",
                    margin: "2px",
                  }}
                >
                  {user}{" "}
                  <CloseIcon
                    style={{ width: "15px", marginLeft: "3px", color: "black" }}
                  />
                </Tag>
              ))
            : "No users selected yet!"}
        </div>
        <List>
          {foundUsers.length &&
            foundUsers.map((user) => (
              <Button
                rightIcon={<AddIcon />}
                key={v4()}
                style={{ cursor: "pointer", color: "black" }}
                onClick={() => updateSelectedUsersPreferences(user)}
              >
                {user}
              </Button>
            ))}
        </List>
      </div>
    );
  };

  const handleCreateChatClick = async () => {
    if (selectedUsers.length) {
      await createNewChat(userData.handle, selectedUsers).then((chatId) =>
        navigate(`/chats/${chatId}`)
      );
    } else {
      showToast(
        "You have to choose at least one person to start a chat!",
        "warning"
      );
    }
  };

  return (
    <div className="selected-users-menu">
      <div className="select-kit-header-wrapper">
        <span className="formatted-selection">{formattedSelection}</span>
        <IconButton
          style={{
            backgroundColor: "transparent",
            color: "bisque",
            marginRight: "5px",
            borderRadius: "5px",
            padding: "5px",
          }}
          aria-label="Add tag"
          icon={<PlusSquareIcon />}
          onClick={() => setShowBar(!showBar)}
        />
      </div>
      {showBar && menu()}
      <Button onClick={handleCreateChatClick}>Connect Now</Button>
    </div>
  );
};

SelectedUsersBar.propTypes = {
  foundUsers: PropTypes.array.isRequired,
  selectedUsers: PropTypes.array.isRequired,
  setSearch: PropTypes.func.isRequired,
  updateSelectedUsersPreferences: PropTypes.func.isRequired,
};

export default SelectedUsersBar;
