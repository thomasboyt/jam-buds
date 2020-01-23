import Axios from 'axios';
import config from '../config';

export function getRhiannonClient() {
  return Axios.create({
    baseURL: config.require('JB_RHIANNON_URL'),
  });
}
