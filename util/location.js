const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = process.env.API_KEY;

const getCoordinatesFromAddress = async (address) => {
  const URL = `https://geocode.search.hereapi.com/v1/geocode?q=${address}&apiKey=${API_KEY}`;

  const response = await axios.get(URL);
  const data = response.data;

  if (!data || data.items.length === 0) {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    );

    throw error;
  }

  const coordinates = data.items[0].position;

  return coordinates;
};

module.exports = getCoordinatesFromAddress;
