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

const Colection = function() {
  const {accounts, instance}= useMsal();
  const [accessToken, setAccessToken] = useState()

  const [address, setAddress] = useState("")
  const [collection, setCollection] = useState

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
  const res = await axios.get("https://api.iblockcore.com/user/address", {headers: { Authorization: `Bearer ${accessToken}`}})
  setAddress(res.data.payload.addresses.nftMarket)
  const {data} = await axios.get("https://api.iblockcore.com/collection/get", {params:{id: res.data.payload.addresses.nftCollectionId}})
  console.log(data)
  setCollection(data)
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
const handleBtnClick = () => {
  setOpenMenu(!openMenu);
  setOpenMenu1(false);
  document.getElementById("Mainbtn").classList.add("active");
  document.getElementById("Mainbtn1").classList.remove("active");
};
const handleBtnClick1 = () => {
  setOpenMenu1(!openMenu1);
  setOpenMenu(false);
  document.getElementById("Mainbtn1").classList.add("active");
  document.getElementById("Mainbtn").classList.remove("active");
};

const dispatch = useDispatch();



return (
  <div>
  <GlobalStyles/>
    { collection.creator &&
      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundColor: 'white'}}>
        <div className='mainbreadcumb'>
        </div>
      </section>
    }

    <section className='container d_coll no-top no-bottom'>
      <div className='row'>
        <div className="col-md-12">
          <div className="d_profile">
            <div className="profile_avatar">
                { collection.creator && 
                  <div className="d_profile_img">
                    <img src={api.baseUrl + collection.creator} alt=""/>
                    <i className="fa fa-check"></i> 
                  </div>
                }
                <div className="profile_name">
                  <h4>
                      { collection.name }                                                
                      <div className="clearfix"></div>
                      { collection.author &&  collection.author.wallet &&
                        <span id="wallet" className="profile_wallet">{ collection.creator}</span>
                      }
                      <button id="btn_copy" title="Copy Text">Copy</button>
                  </h4>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>

    <section className='container no-top'>
          <div className='row'>
            <div className='col-lg-12'>
                <div className="items_filter">
                  <ul className="de_nav">
                      <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>On Sale</span></li>
                      <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Owned</span></li>
                  </ul>
                  <div className="SearchArea">
                    <div className="searchBar">
                      <form id="form" role="search">
                        <input type="search" id="query" name="q"
                          placeholder="Search..."
                          aria-label="Search through site content"/>
                          <button>
                            <svg viewBox="0 0 1024 1024"><path class="path1" 
                            d="M848.471 928l-263.059-263.059c-48.941 36.706-110.118 55.059-177.412 
                            55.059-171.294 0-312-140.706-312-312s140.706-312 312-312c171.294 
                            0 312 140.706 312 312 0 67.294-24.471 128.471-55.059 177.412l263.059 
                            263.059-79.529 79.529zM189.623 408.078c0 121.364 97.091 218.455 218.455 
                            218.455s218.455-97.091 218.455-218.455c0-121.364-103.159-218.455-218.455-218.455-121.364 
                            0-218.455 97.091-218.455 218.455z"></path></svg>
                          </button>
                      </form>
                    </div>
                    <div className="selectBar">
                      <form id="selectFrom" role="select">
                        <fieldset id = "select">
                          <select
                              name="seleOptions"
                              id="select"
                              autocomplete="off"
                              required
                            >
                            <option value="first">Recent Listed</option>
                            <option value="second">Recent Created</option>
                            <option value="third"> Recently Sold</option>
                            <option value="fourth"> Recently Received</option>
                            <option value="fifth"> Ending Soon</option>
                            <option value="sixth"> Price: Low to high</option>
                            <option value="seventh"> Price: High to low</option>
                            <option value="eighth"> Highest Last Sale</option>
                            <option value="nineth"> Most Viewed</option>
                            <option value="tenth"> Most favorited</option>
                            <option value="eleventh"> Oldest</option>
                          </select>
                        </fieldset>
                      </form>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        {openMenu && (  
          <div id='zero1' className='onStep fadeIn'>
            <ColumnNewRedux shuffle showLoadMore={false} creatorAddress={collection.creator} />
          </div>
        )}
        {openMenu1 && ( 
          <div id='zero2' className='onStep fadeIn'>
            <ColumnNewRedux shuffle showLoadMore={false} />
          </div>
        )}
        </section>
    <Footer />
  </div>
);
}
export default memo(Colection);