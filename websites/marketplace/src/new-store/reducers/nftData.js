import { useState, useLayoutEffect } from "react";
import { loadMarketNFTs } from "../../utils/nftFunctions";
import { store } from "../new-store";
const storeKey = "list";

// DEFINITIONs
const initialState =[
];

const reducers = {
  getNftBreakdown: (state,item) => [...state,...item]
};

// HELPERS
const getState = () => store.getState()[storeKey];

const subscribe = f => {
  let lastState = getState();
  return store.subscribe(
    () => lastState !== getState() && f((lastState = getState()))
  );
};

// EXPORTS
export const useNFTs = () => {
  const [state, setState] = useState(getState());
  useLayoutEffect(() => subscribe(setState), [setState]);
  return state;
};

export const getNFT = async ()=>{
  try {
    const data = await loadMarketNFTs()
    store.dispatch({ type: "getNftBreakdown", payload: data});
  } catch (err) {
      console.log(err)
  }
}

export const createItem = item =>
  store.dispatch({ type: "addItem", payload: item });
export const deleteItem = item =>
  store.dispatch({ type: "deleteItem", payload: item });

// INJECT-REDUCERS INTO REDUX STORE
store.injectReducer(storeKey, (state = initialState, { type, payload }) =>
  reducers[type] ? reducers[type](state, payload) : state
);
