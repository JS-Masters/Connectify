import { SimpleGrid, Img } from "@chakra-ui/react";
import PropTypes from "prop-types";
import "./GifGrid.css";

const GifGrid = ({ gifs, handleGif }) => {
  return (
    <SimpleGrid
    id="gif-simple-grid"
      columns={3}
      spacing={5}
      overflow="hidden"
      overflowY="auto"
      width={"500px"}
      height={"300px"}
      p={"10px"}
      border={"1px solid black"}
    >
      {gifs.map((gif) => {
        return (
          <Img
            key={gif.id}
            src={gif.images.downsized.url}
            alt="gif"
            width={"200px"}
            cursor="pointer"
            onClick={(event) => {
              event.preventDefault();
              handleGif(gif.images.downsized.url);
            }}
          />
        );
      })}
    </SimpleGrid>
  );
};

GifGrid.propTypes = {
  gifs: PropTypes.array.isRequired,
  handleGif: PropTypes.func.isRequired,
};

export default GifGrid;
