import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  getSearchGifs,
  getTrendingGifs,
} from "../../services/giphy.services.js";
import { Box, Button, HStack, Input } from "@chakra-ui/react";
import GifGrid from "./GifGrid";

const Giphy = ({ handleGif }) => {
  const [gifs, setGifs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState(false);

  useEffect(() => {
    getTrendingGifs()
      .then(setGifs)
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (search) {
      getSearchGifs(searchTerm)
        .then((data) => {
          setGifs(data);
          setSearchTerm("");
          setSearch(false);
        })
        .catch((e) => console.error(e));
    }
  }, [search]);

  return (
    <Box
      position={"absolute"}
      bottom={"55px"}
      right={"0"}
      bg="#242424"
      p="10px"
      borderRadius="5px"
    >
      <HStack w={"500px"}>
        <Input
          value={searchTerm}
          placeholder="Search for gifs..."
          onChange={(e) => setSearchTerm(e.target.value)}
          width={"83%"}
        />
        <Button onClick={() => setSearch(true)}>Search</Button>
      </HStack>
      <GifGrid gifs={gifs} handleGif={handleGif} />
    </Box>
  );
};

Giphy.propTypes = {
  handleGif: PropTypes.func.isRequired,
};

export default Giphy;
