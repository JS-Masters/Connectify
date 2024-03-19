// import PropTypes from "prop-types";
import { useContext, useState } from "react";
import AppContext from "../../providers/AppContext";
import { Form } from "react-router-dom";
import {
  Button,
  HStack,
  Heading,
  Img,
  Input,
  ListItem,
  Modal,
  ModalContent,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { storage } from "../../config/firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateUserByHandle } from "../../services/user.services";
import { v4 } from "uuid";
import { CloseIcon } from "@chakra-ui/icons";
import "./UploadForm.css";

const UploadForm = () => {
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const { userData } = useContext(AppContext);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const showToast = (msg, status) => {
    toast({
      title: "Updating avatar",
      description: msg,
      // duration: 5000,
      isClosable: true,
      status: status,
      position: "top",
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSelectedFileUrl(URL.createObjectURL(event.target.files[0]));
  };

  const handleUploadClick = () => {
    const fileInput = document.querySelector("input[type='file']");
    fileInput.click();
  };

  const handleCloseClick = () => {
    setSelectedFile(null);
    setSelectedFileUrl(null);
    onClose();
  };

  const handleSubmit = () => {
    if (selectedFile === null) {
      showToast("Please select a file!", "error");
      return;
    }

    const fileRef = ref(
      storage,
      `${userData.handle}/${selectedFile.name + v4()}`
    );

    uploadBytes(fileRef, selectedFile)
      .then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url) => {
            updateUserByHandle(userData.handle, "avatarUrl", url);
            showToast("Image uploaded!", "success");
            onClose();
          })
          .catch((error) => showToast(error.message, "error"));
      })
      .catch((error) => showToast(error.message, "error"));
  };

  return (
    <>
      <ListItem
        className="dropdown-item"
        onClick={onOpen}
        cursor="pointer"
        m="8px"
        border="1px solid gray"
        borderRadius="5px"
        fontSize="sm"
        p="5px"
        textAlign="center"
      >
        Upload Avatar
      </ListItem>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent
        
          border="2px dashed #b88e1d"
          p="15px"
          m="auto"
          bg="transparent"
          w="fit-content"
          textAlign="center"
          color="goldenrod"
        >
          <Form id='upload-photo-modal' onSubmit={handleSubmit}>
            <CloseIcon
              cursor="pointer"
              float="right"
              m="10px"
              onClick={handleCloseClick}
            />
            {selectedFileUrl ? (
              <>
                <br />
                <Img h="300px" w="300px" src={selectedFileUrl} alt="Selected" />
                <HStack mt="10px" justifyContent="center">
                  <Button className="upload-cancel-buttons" type="submit" >
                    Upload
                  </Button>
                  <Button onClick={handleCloseClick}>
                    Cancel
                  </Button>
                </HStack>
              </>
            ) : (
              <>
                <Heading>You haven&apos;t uploaded anything yet!</Heading>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <input onClick={handleUploadClick} id="upload-now-button" type="button" value='Upload Now'/>           
              </>
            )}
          </Form>
        </ModalContent>
      </Modal>
    </>
  );
};

UploadForm.propTypes = {};

export default UploadForm;
