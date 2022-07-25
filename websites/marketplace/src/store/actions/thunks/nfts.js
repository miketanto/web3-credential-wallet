import { Axios, Canceler } from '../../../core/axios';
import * as actions from '../../actions';
import api from '../../../core/api';
import axios from 'axios'
import {ethers} from 'ethers'
import {ERC1155Market,ERC1155NFT} from '../../../contracts'
import { loadMarketNFTs } from '../../../utils/nftFunctions';

export const fetchNftsBreakdown = (creatorAddress, isMusic = false) => async (dispatch, getState) => {
  
  //access the state
  const state = getState();
  console.log(state);

  dispatch(actions.getNftBreakdown.request()); //Make Reducer state specify that its loading

  try {
    let filter
    if(creatorAddress){
      filter = {params:{owner:creatorAddress}}
    }
    
    const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/nft/get`, filter);
    console.log(data.payload.nfts)
    dispatch(actions.getNftBreakdown.success(data.payload.nfts))
  } catch (err) {
    dispatch(actions.getNftBreakdown.failure(err));
  }
};

export const fetchNftShowcase = () => async (dispatch) => {

  dispatch(actions.getNftShowcase.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.nftShowcases}`, {
      cancelToken: Canceler.token,
      params: {}
    });

    dispatch(actions.getNftShowcase.success(data));
  } catch (err) {
    dispatch(actions.getNftShowcase.failure(err));
  }
};

export const fetchNftDetail = (nftId) => async (dispatch) => {

  dispatch(actions.getNftDetail.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.nfts}/${nftId}`, {
      cancelToken: Canceler.token,
      params: {}
    });

    dispatch(actions.getNftDetail.success(data));
  } catch (err) {
    dispatch(actions.getNftDetail.failure(err));
  }
};
