import axios from 'axios';
import {BASE_URL} from '../constants/mockData';

export const postReq2 = (des_url, data, token, isFile) => {
  let url = BASE_URL + des_url;
  console.log(token);
  console.log(data);
  console.log(url, 'BASE_URL-->>>');
  return new Promise((resolve, reject) => {
    let headers = {};
    if (isFile) {
      headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    if (token) {
      headers = {...headers, Authorization: `Bearer ${token}`};
    }
    console.log(headers, 'headers');
    axios
      .post(url, data, {headers})
      .then(function (response) {
        resolve(response?.data);
        console.log(response?.data);
      })
      .catch(function (error) {
        resolve(error.response?.data);
      })
      .finally(function () {});
  });
};

export const patchReq2 = (des_url, data, isToken, isFormData) => {
  let url = BASE_URL + des_url;
  console.log(url, 'BASE_URL-->>>');
  return new Promise((resolve, reject) => {
    let headers = {};
    if (isToken) {
      headers = {...headers, Authorization: `Bearer ${isToken}`};
    }
    if (isFormData) {
      headers = {...headers, 'Content-Type': 'multipart/form-data'};
    }
    console.log(headers, 'headers');
    axios
      .patch(url, data, {headers})
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error.response);
      })
      .finally(function () {});
  });
};

export const postReqFile = (url, data) => {
  return new Promise((resolve, reject) => {
    let headers = {
      'Content-Type': 'multipart/form-data',
    };
    axios
      .post(url, data, headers)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {});
  });
};

export const getReq2 = (des_url, token) => {
  let url = BASE_URL + des_url;
  console.log(url, 'BASE_URL-->>>');
  return new Promise((resolve, reject) => {
    let headers = {};
    if (token) {
      headers = {...headers, Authorization: `Bearer ${token}`};
    }

    axios
      .get(url, {headers})
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      })
      .finally(function () {});
  });
};
