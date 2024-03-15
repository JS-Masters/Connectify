import PropTypes from 'prop-types';

import {
  Modal,
  ModalContent,
  Box,
} from '@chakra-ui/react'

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';


const PickerModal = ({ isOpen, handleReaction, onClose }) => {

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* <ModalOverlay /> */}
        <ModalContent w='fit-content' bg='transparent'>
          <Box>
            <Picker data={data} previewPosition='none' onEmojiSelect={(e) => {
              handleReaction(e.native);
              onClose();
            }} />
          </Box>
        </ModalContent>
      </Modal>
    </>
  )

};

PickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleReaction: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PickerModal;