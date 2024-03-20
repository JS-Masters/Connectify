import PropTypes from "prop-types";
import { Box, Image, Text } from "@chakra-ui/react";
import { getFileNameAndExtension } from "../services/storage.service";
import { DownloadIcon } from "@chakra-ui/icons";

const FilePreview = ({ fileUrl }) => {
  const [fileName, fileType] = getFileNameAndExtension(fileUrl);

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading GIF:", error);
    }
  };

  const renderPreview = () => {
    switch (fileType) {
      case "png":
      case "jpeg":
      case "jpg":
      case "gif":
        return (
          <Box position="relative" width="fit-content">
            <Image as="img" src={fileUrl} alt="Image" maxW="60%" h="auto" />
            <DownloadIcon
              cursor="pointer"
              position="absolute"
              top="5px"
              left="5px"
              color="cyan"
              fontSize="large"
              onClick={handleDownload}
            />
          </Box>
        );
      case "video":
        return (
          <Box as="video" controls w="100%" h="auto">
            <source src={fileUrl} type="video/mp4" />
          </Box>
        );
      default:
        return (
          <Box w="100%" h="auto" display="flex" gap="20px">
            <Image
              src="/public/file-solid.svg"
              alt="File"
              cursor="pointer"
              w="5%"
              h="auto"
            />
            <Box fontSize="17px" fontWeight="bold">
              <Text>{fileName}</Text>
              <Text>{fileType.toUpperCase()}</Text>
            </Box>
          </Box>
        );
    }
  };

  return renderPreview();
};

FilePreview.propTypes = {
  fileUrl: PropTypes.string.isRequired,
};

export default FilePreview;
