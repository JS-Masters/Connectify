import PropTypes from "prop-types";
import { AddIcon, CloseIcon, PlusSquareIcon } from "@chakra-ui/icons";
import { Button, Checkbox, IconButton, List, ListItem, Tag } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { v4 } from "uuid";
import "./SelectedUsersBar.css";
import AppContext from "../../providers/AppContext";

const SelectedUsersBar = ({
  allUsers = [],
  selectedUsers = [],
  setSearch,
  updateSelectedUsersPreferences
}) => {
  const { userData } = useContext(AppContext);
  const [showBar, setShowBar] = useState(false);
  const [searchField, setSearchField] = useState("");

  const updateSearchField = (event) => {
    setSearchField(event.target.value);
    setSearch(event.target.value);
  };

  const formattedSelection =
    selectedUsers.length > 0
      ? selectedUsers.join(", ")
      : "";

  const menu = () => {
    const foundUsers = allUsers
      .filter((handle) => handle.toLowerCase().includes(searchField.toLowerCase()) && !selectedUsers.includes(handle) && handle !== userData.handle)
      .slice(0, 5);

    return (
      <div className="drop-down-menu">
        <input
          type="search"
          value={searchField}
          onChange={updateSearchField}
          placeholder="Connect with..."
        />
        <div className="selected-content" style={{ color: 'black' }}>
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
                  color: 'black'
                }}
              >
                {user}{" "}
                <CloseIcon style={{ width: "15px", marginLeft: "3px", color: 'black' }} />
              </Tag>
            ))
            : "No users selected yet!"}
        </div>
        <List>
          {foundUsers.length && foundUsers.map((user) => (
            <Button rightIcon={<AddIcon/>} key={v4()} style={{ cursor: "pointer", color: 'black' }} onClick={() => updateSelectedUsersPreferences(user)}>
              {user}
            </Button>
          ))
          }
        </List>
      </div>
    );
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
    </div>
  );
};

SelectedUsersBar.propTypes = {
  allUsers: PropTypes.array.isRequired,
  selectedUsers: PropTypes.array.isRequired,
  setSearch: PropTypes.func.isRequired,
  updateSelectedUsersPreferences: PropTypes.func.isRequired,
};

export default SelectedUsersBar;
