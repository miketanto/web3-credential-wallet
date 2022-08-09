import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Footer from '../template-components/footer';
import { createGlobalStyle } from 'styled-components';
import ColumnNewRedux from "../template-components/ColumnNewRedux";
import * as selectors from '../../store/selectors';
import { fetchHotCollections } from "../../store/actions/thunks";
import api from "../../core/api";
import { useMsal } from '@azure/msal-react'
import AzureAuthenticationContext from "../../configs/azure-context";
import axios from 'axios'
import blankAvatar from '../../assets/blankAvatar.jpg'
import CheckboxFilter from '../template-components/CheckboxFilter';


const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`;

const Colection = function({ collectionId = 1 }) {

const {accounts, instance}= useMsal();
const [accessToken, setAccessToken] = useState()

const [address, setAddress] = useState("")
const [collection, setCollection] = useState({

})

const authenticationModule = new AzureAuthenticationContext(instance)

  const request = {
  scopes: ['User.Read'],
  account: accounts[0],
}


const accessTokenCallback = (userAccount) => {
  setAccessToken(userAccount.idTokenClaims.oid)
  getAddressAndCollection(userAccount.idTokenClaims.oid)
}
const getAddressAndCollection= async(accessToken)=>{
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/address`, {headers: { Authorization: `Bearer ${accessToken}`}})
  setAddress(res.data.payload.addresses.nftMarket)
  const {data} = await axios.get(`${process.env.REACT_APP_API_URL}/collection/get`, {params:{collection_id: res.data.payload.addresses.nftCollectionId}})
  console.log(data.payload[0])
  setCollection(data.payload[0])
}

  useEffect(() => {
  
  instance.acquireTokenSilent(request) 
    .then(async (res) => {
      setAccessToken(res.accessToken)
              console.log('getAccount')
      getAddressAndCollection(res.accessToken)
    })
    .catch((e) => {
       authenticationModule.login('loginPopup',accessTokenCallback)
  })
}, [])




const [openMenu, setOpenMenu] = React.useState(true);
const [openMenu1, setOpenMenu1] = React.useState(false);

const dispatch = useDispatch();
const hotCollectionsState = useSelector(selectors.hotCollectionsState);
const hotCollections = hotCollectionsState.data ? hotCollectionsState.data[0] : {};

useEffect(() => {
    dispatch(fetchHotCollections(collectionId));
}, [dispatch, collectionId]);

return (
  <div>
  <GlobalStyles/>
    { hotCollections.author &&  hotCollections.author.banner &&
      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${api.baseUrl + hotCollections.author.banner.url})`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>
    }

    <section className='container d_coll no-top no-bottom'>
      <div className='row'>
        <div className="col-md-12">
          <div className="d_profile">
            <div className="profile_avatar">
                { hotCollections.author &&  hotCollections.author.avatar &&
                  <div className="d_profile_img">
                    <img src={blankAvatar} alt=""/>
                    <i className="fa fa-check"></i> 
                  </div>
                }
                <div className="profile_name">
                  <h4>
                      { collection.name }                                                
                      <div className="clearfix"></div>
                      { collection.creator &&
                      <div>
                        <span id="wallet" className="profile_wallet">{ collection.creator }</span>
                        </div>
                      }
                  </h4>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>

    <section className='container no-top'>
       {/* analogous to allnfts*/}
          <div className='row'>
            <div className='col-md-3'> 
              <CheckboxFilter /> 
            </div>
            <div className="col-md-9">
              <ColumnNewRedux shuffle showLoadMore={false} creatorAddress={collection.creator} />
            </div>
          </div>
        </section>
    <Footer />
  </div>
);
}
export default memo(Colection);