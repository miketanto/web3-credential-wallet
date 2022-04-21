import applicationReducer from './application'
import authReducer from './auth'
import userReducer from './user'
import walletReducer from './wallet'

export default {
  // [addressApi.reducerPath]: addressApi.reducer,
  // chain: chainReducer,
  application: applicationReducer,
  auth: authReducer,
  user: userReducer,
  wallet: walletReducer,
}
