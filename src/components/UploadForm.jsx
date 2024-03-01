// import PropTypes from "prop-types";
import Popup from "reactjs-popup";
import { useContext, useState } from "react";
import AppContext from "../providers/AppContext";
import { Form } from "react-router-dom";
import { Button, Heading, Img, Input, Text, useToast } from "@chakra-ui/react";
import { storage } from "../config/firebase-config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateUserByHandle } from "../services/user.services";
import { v4 } from "uuid";
import { CloseIcon } from "@chakra-ui/icons";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const { userData } = useContext(AppContext);

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
    <Popup trigger={<Text cursor="pointer">Change avatar</Text>} modal nested>
      {(close) => (
        <Form
          style={{
            border: "2px dashed green",
            padding: "15px",
            textAlign: "center",
          }}
          onSubmit={handleSubmit}
        >
          <CloseIcon
            cursor="pointer"
            float="right"
            m="10px"
            onClick={() => handleCloseClick(close)}
          />
          {selectedFileUrl ? (
            <>
              <Img h="500px" w="400px" src={selectedFileUrl} alt="Selected" />
              <Button type="submit">Upload</Button>
            </>
          ) : (
            <>
              <Heading>You haven&apos;t uploaded anything yet!</Heading>
              <Input
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <Button onClick={handleUploadClick}>Upload Now</Button>
            </>
          )}
        </Form>
      )}
    </Popup>
  );
};

UploadForm.propTypes = {};

export default UploadForm;
