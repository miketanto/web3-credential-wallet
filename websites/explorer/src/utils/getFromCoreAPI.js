import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL

// TODO: Input validation

/**
 * Get request for iBlock Core API
 * @param endpoint
 * @param config Axios config (e.g. params, headers)
 * @returns {Promise<unknown>}
 */

export default async function getFromCoreAPI(endpoint, config = {}) {
  // axios returns API data things in `.data`
  return axios.get(API_URL + endpoint, config)
    .then((res) => res.data)
    .then((res) => {
      if (res.error) return Promise.reject(new Error(res.msg))
      return res
    })
}
