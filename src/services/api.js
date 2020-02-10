import axios from 'axios';

const api = axios.create({
  baseURL: 'https://xivapi.com',
});

export default api;
