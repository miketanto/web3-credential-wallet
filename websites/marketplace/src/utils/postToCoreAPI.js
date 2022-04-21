import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL

// TODO: Input validation

/**
 * Post request for iBlock Core API
 * @param endpoint
 * @param data Post data
 * @param config Axios config (e.g. params, headers)
 * @returns {Promise<unknown>}
 */
export default async function postToCoreAPI(endpoint, data = {}, config = {}) {
  // axios returns API data things in `.data`
  return axios.post(API_URL + endpoint, data, config)
    .then((res) => res.data)
    .then((res) => {
      if (res.error) return Promise.reject(new Error(res.msg))
      return res
    })
}
