/**
 * Mocking client-server processing
 */
import { storeProducts } from '../../mock-data/store-products'

const TIMEOUT = 100

export default {
  getProducts: (cb, timeout) => setTimeout(() => cb(storeProducts), timeout || TIMEOUT),
  buyProducts: (payload, cb, timeout) => setTimeout(() => cb(), timeout || TIMEOUT),
}
