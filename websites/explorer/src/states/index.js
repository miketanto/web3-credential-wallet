import { applyMiddleware, compose, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

import { products } from './actions'
import reducer from './reducers'

const middleware = [thunk]
if (process.env.NODE_ENV !== 'production') middleware.push(createLogger())

// If you have the Redux Dev Tools extension installed on your browser, this enables it
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(reducer, composeEnhancers(applyMiddleware(...middleware)))
store.dispatch(products.getAll())

export default store
