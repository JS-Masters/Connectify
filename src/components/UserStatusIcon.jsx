import PropTypes from 'prop-types'
import { Box } from "@chakra-ui/react";
import { statuses } from "../common/constants";

const UserStatusIcon = ({ currentStatus = '', size = '12px', toggleStatusMenu = () => { } }) => {
    if (currentStatus === statuses.online) {
        return (
            <Box
                onClick={toggleStatusMenu}
                w={size}
                h={size}
                borderRadius="50%"
                bg="green"
            />
        );
    } else if (currentStatus === statuses.inMeeting) {
        return (
            <Box
                onClick={toggleStatusMenu}
                w={size}
                h={size}
                borderRadius="50%"
                bg="orange"
            />
        );
    } else if (currentStatus === statuses.doNotDisturb) {
        return (
            <Box
                onClick={toggleStatusMenu}
                w={size}
                h={size}
                borderRadius="50%"
                bg="red"
            />
        );
    } else if (currentStatus === statuses.offline) {
        return (
            <Box
                onClick={toggleStatusMenu}
                w={size}
                h={size}
                borderRadius="50%"
                border="3px solid gray"
            />
        );
    }
};

UserStatusIcon.propTypes = {
    currentStatus: PropTypes.string.isRequired,
    size: PropTypes.string,
    toggleStatusMenu: PropTypes.func
}


export default UserStatusIcon;