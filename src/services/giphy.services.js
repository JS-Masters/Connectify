import { GIPHY_API_KEY, GIPHY_BASE_URL } from "../common/constants";



const generateFetchLink = (endpoint, fetchDataToRequest) => {
    let link = `${GIPHY_BASE_URL}${endpoint}?api_key=${GIPHY_API_KEY}`;

    Object.keys(fetchDataToRequest).map(key => {
        if (fetchDataToRequest[key]) {
            link += `&${key}=${fetchDataToRequest[key]}`;
        }
    });

    return link;
}



export const getSearchGifs = async (searchTerm = '') => {

    return fetch(generateFetchLink('search', { 'q': `${searchTerm}`, 'limit': 15, 'rating': 'g' }))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        })
        .then((result) => result.data)
        .catch((error) => console.error(error));

}


export const getTrendingGifs = async () => {

    return fetch(generateFetchLink('trending', { limit: 15, rating: 'g' }))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        })
        .then((result) => result.data)
        .catch((error) => console.error(error));

};

