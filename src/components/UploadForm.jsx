// import PropTypes from "prop-types";
import { useContext, useState } from "react";
import AppContext from "../providers/AppContext";
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
import { storage } from "../config/firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateUserByHandle } from "../services/user.services";
import { v4 } from "uuid";
import { CloseIcon } from "@chakra-ui/icons";

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

  const handleCloseClick = (close) => {
    setSelectedFile(null);
    setSelectedFileUrl(null);
    close();
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
          })
          .catch((error) => showToast(error.message, "error"));
      })
      .catch((error) => showToast(error.message, "error"));
  };

  return (
    <>
      <ListItem
        onClick={onOpen}
        cursor="pointer"
        m="8px"
        border="1px solid gray"
        borderRadius="10px"
        fontSize="sm"
        p="5px"
        textAlign="center"
      >
        Upload Avatar
      </ListItem>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent
          border="2px dashed green"
          p="15px"
          m="auto"
          bg="transparent"
          w="fit-content"
          textAlign="center"
          color="goldenrod"
        >
          <Form onSubmit={handleSubmit}>
            <CloseIcon
              cursor="pointer"
              float="right"
              m="10px"
              onClick={() => handleCloseClick(close)}
            />
            {selectedFileUrl ? (
              <>
                <br />
                <Img h="300px" w="300px" src={selectedFileUrl} alt="Selected" />
                <HStack mt="10px" justifyContent="center">
                  <Button type="submit" colorScheme="green">
                    Upload
                  </Button>
                  <Button onClick={handleCloseClick} colorScheme="red">
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
                <Button onClick={handleUploadClick} colorScheme="green">
                  Upload Now
                </Button>
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
