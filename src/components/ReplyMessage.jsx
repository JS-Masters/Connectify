import { useState } from 'react';
import { Box, Textarea, Button, Avatar, Text } from '@chakra-ui/react';
import { v4 } from 'uuid';
import PropTypes from 'prop-types';


const ReplyMessage = ({
	reply,
	currentUserHandle,
	onEditReply,
	onDeleteReply,
	message
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedReplyContent, setEditedReplyContent] = useState(reply.content);
	const [isDeletingReply, setIsDeletingReply] = useState(false);

	const handleEditClick = () => {
		setIsEditing(true);
	};

	const handleSaveClick = () => {
		onEditReply(message.id, reply.id, editedReplyContent);
		setIsEditing(false);
	};

	const handleCancelClick = () => {
		setIsEditing(false);
	};

	const handleDeleteClick = () => {
		setIsDeletingReply(true);
		onDeleteReply(message.id, reply.id);
	};

	return (
		<Box p={2} m={2} bg="gray.100" borderRadius="md">
			<Box display="flex" justifyContent="space-between">
				<Box display="flex" alignItems="center">
					<Avatar size="sm" name={reply.author} />
					<Box ml={2}>
						<Text fontSize="sm" fontWeight="bold">{reply.author}</Text>
						<Text fontSize="sm">{reply.createdOn}</Text>
					</Box>
				</Box>
				<Box display="flex" alignItems="center">
					{currentUserHandle === reply.author && (
						<Box display="flex" alignItems="center">
							<Button size="xs" onClick={handleEditClick} mr={2}>Edit</Button>
							<Button size="xs" onClick={handleDeleteClick}>Delete</Button>
						</Box>
					)}
				</Box>
			</Box>
			{'deleteMessage' in reply ? (
				<Text>
					{reply.deleteMessage} by {reply.deletedBy} on {reply.deletedOn}
				</Text>
			) : (
				<Text>
					{isEditing ? (
						<Box mt={2}>
							<Textarea value={editedReplyContent} onChange={(e) => setEditedReplyContent(e.target.value)} />
							<Box mt={2}>
								<Button size="sm" onClick={handleSaveClick} mr={2}>Save</Button>
								<Button size="sm" onClick={handleCancelClick}>Cancel</Button>
							</Box>
						</Box>
					) : (
						<Box mt={2}>
							<Box display="flex" justifyContent="space-between">
								<Box>
									<Text>Edited on: {reply.editedOn}</Text>
									<Text>{reply.content}</Text>
								</Box>
								<Box>
									{'reactions' in reply && Object.values(reply.reactions).map((reaction) => (
										<span key={v4()}>{reaction}</span>
									))}
								</Box>
							</Box>
						</Box>
					)}
				</Text>
			)}
		</Box>
	);
};

ReplyMessage.propTypes = {
	reply: PropTypes.object.isRequired,
	currentUserHandle: PropTypes.string.isRequired,
	onEditReply: PropTypes.func.isRequired,
	onDeleteReply: PropTypes.func.isRequired,
	message: PropTypes.object.isRequired
};

export default ReplyMessage;
