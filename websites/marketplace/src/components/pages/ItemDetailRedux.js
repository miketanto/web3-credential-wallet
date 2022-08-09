import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Clock from "../template-components/Clock";
import Footer from "../template-components/footer";
import { createGlobalStyle } from "styled-components";
import * as selectors from "../../store/selectors";
import { fetchNftDetail } from "../../store/actions/thunks";
/*import Checkout from "../template-components/Checkout";
import Checkoutbid from "../template-components/Checkoutbid";*/
import api from "../../core/api";
import moment from "moment";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import { buyNft } from "../../utils/nftFunctions";
import { loadMarketNFTs, getAmountListed } from "../../utils/nftFunctions";
import { set } from "date-fns";
import { useMsal } from '@azure/msal-react'
import AzureAuthenticationContext from "../../configs/azure-context";
import axios from "axios";
import {erc1155nftaddress} from "../../configs/contracts/contract_config";

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
  }
  .mr40{
    margin-right: 40px;
  }
  .mr15{
    margin-right: 15px;
  }
  .btn2{
    background: #f6f6f6;
    color: #8364E2 !important;
  }
  .nft-summary {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-item: center;
  }
  .card {
      margin: 1rem auto 1rem;
  }
  .card-header {
      background-color: #fff;
  }
  .info-block-row {
    min-height: 60px;
    display: flex;
    justify-content: center;
    align-item: center;
  }
  .tags-container {
    display: flex;
    justify-content: flex-start;
    align-item: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  .tag-box {
    background-color: #1F4096;
    color: white;
    font-size: .8rem;
    padding: .1rem .4rem;
    border-radius: .3rem;
    margin-right: .3rem;
  }
  .info-block-header {
      display: flex;
      justify-content: flex-start;
      align-item: center;
      cursor: pointer;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-item: center;
    flex-wrap: wrap;
  }
  section {
    padding: 2rem 0;
  }
  .summary-section {
    padding: .5rem 0;
  }
  .address {
    overflow-wrap: break-word;
    max-width: 100%;
  }
  .detail-content {
      flex-direction: column;
      justify-content: flex-start;
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

const ItemDetailRedux = ({ nftId }) => {
  const { library, account } = useActiveWeb3React();

  const {accounts, instance}= useMsal();
  const authenticationModule = new AzureAuthenticationContext(instance)
  const [openProperties, setOpenProperties] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openPriceHistory, setOpenPriceHistory] = useState(true);
  const [openListings, setOpenListings] = useState(true);
  const [openOffers, setOpenOffers] = useState(true);
  const [openItemActivity, setOpenItemActivity] = useState(true);
  const [openMoreThisCollection, setOpenMoreThisCollection] = useState(true);
  const [nft, setNft] = useState({});
  const [available, setAvailable] = useState();

  const dispatch = useDispatch();
  const items = useSelector(selectors.nftItems);
  // const nft = nftDetailState.data ? nftDetailState.data : [];
  const [openCheckout, setOpenCheckout] = React.useState(false);
  const [openCheckoutbid, setOpenCheckoutbid] = React.useState(false);
  const [accessToken, setAccessToken] = useState()

  const [address, setAddress] = useState("")

  const request = {
    scopes: ['User.Read'],
    account: accounts[0],
  }

  const accessTokenCallback = (userAccount) => {
    setAccessToken(userAccount.idTokenClaims.oid)
    getAddress(userAccount.idTokenClaims.oid)
  }

  const getAddress = async(accessToken)=>{
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/user/address`, {headers: { Authorization: `Bearer ${accessToken}`}})
    setAddress(res.data.payload.addresses.nftMarket)
    // console.log(res)
    const balanceres = await axios.get(`${process.env.REACT_APP_API_URL}/user/balance`, {headers: { Authorization: `Bearer ${accessToken}`}})
    console.log(balanceres)
  }

  //const { user: { address, signer }, id } = options


  useEffect(() => {
    let first
    const fetchState = async () => {
      let item
      if(items.length!==0){
        item = items.filter((item) => item.itemId == nftId);
        window.sessionStorage.setItem("item", JSON.stringify(item)) //Let's item persist in session storage so refreshes don't clear it
      }
      first = JSON.parse(window.sessionStorage.getItem("item"))
      setNft({ ...first[0], currentOwner: first[0].currentOwner.slice(2, 8) }); 

      // let amount = await getAmountListed(item[0].tokenId); // these two lines cause some problems
      // setAvailable(amount); 
      };
    fetchState()

    instance.acquireTokenSilent(request)
        .then(async (res) => {
          setAccessToken(res.accessToken)
          console.log('getAccount')
          //getAddress(res.accessToken)
        })
        .catch((e) => {
          authenticationModule.login('loginPopup',accessTokenCallback)
        })
  }, [dispatch, nftId]);

  const buyNft = async(nft)=>{
    console.log(nft)
    const quantity = 1
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/nft/buy`,{
      id: Number(nft.itemId),
      quantity
    },{
      headers: { Authorization: `Bearer ${accessToken}`, token: accessToken },
      params: {id: Number(nft.itemId)}
    })
    console.log(res)
    return res
  }

  return (
    <div>
      <GlobalStyles />
      <section className="container">
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-6 text-center">
            <h2 className="title-col-1">{nft.name}</h2>
            <div className="card">
              <div className="card-header">
                <i className="fa fa-heart"></i>
                {nft.likes}
              </div>
              <div className="card-body">
                <div className="image-box">
                  <img
                    src={nft.image}
                    className="img-fluid img-rounded mb-sm-30"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <section className="summary-section info-block">
              <div className="nft-summary card">
                <div className="list-group list-group-flush">
                  <div className="description">
                    <div className="list-group-item info-block-row info-block-header">
                      <h4 className="summary-btn">Description</h4>
                    </div>
                    <div className="description-content detail-row info-block-row list-group-item">
                      Created by
                      <div className="address">{nft.creator}</div>
                    </div>
                  </div>
                  <div className="properties">
                    <div
                      className="list-group-item info-block-row info-block-header"
                      onClick={() => setOpenProperties(!openProperties)}
                    >
                      <h4 className="summary-btn">Properties</h4>
                    </div>
                    {openProperties && (
                      <div className="properties_content info-block-row list-group-item">
                        <div className="row mt-5">
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Background</h5>
                              <h4>Yellowish Sky</h4>
                              <span>85% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Eyes</h5>
                              <h4>Purple Eyes</h4>
                              <span>14% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Nose</h5>
                              <h4>Small Nose</h4>
                              <span>45% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Mouth</h5>
                              <h4>Smile Red Lip</h4>
                              <span>61% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Neck</h5>
                              <h4>Pink Ribbon</h4>
                              <span>27% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Hair</h5>
                              <h4>Pink Short</h4>
                              <span>35% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Accessories</h5>
                              <h4>Heart Necklace</h4>
                              <span>33% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Hat</h5>
                              <h4>Cute Panda</h4>
                              <span>62% have this trait</span>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-sm-6">
                            <div className="nft_attr">
                              <h5>Clothes</h5>
                              <h4>Casual Purple</h4>
                              <span>78% have this trait</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="about">
                    <div
                      className="list-group-item info-block-row info-block-header"
                      onClick={() => setOpenAbout(!openAbout)}
                    >
                      <h4 className="summary-btn">About {nft.name}</h4>
                    </div>
                    {openAbout && (
                      <div className="about-content info-block-row list-group-item">
                        {nft.description}
                      </div>
                    )}
                  </div>
                  <div className="details">
                    <div
                      className="list-group-item info-block-row info-block-header"
                      onClick={() => setOpenDetails(!openDetails)}
                    >
                      <h4 className="summary-btn">Details</h4>
                    </div>
                    {openDetails && (
                      <div className="detail-content info-block-row list-group-item">
                        <div className="detail-row">
                          Contract Address{" "}
                          <span className="address">{nft.nftContract}</span>
                        </div>
                        <div className="detail-row">
                          Token ID <span>{nft.tokenId}</span>
                        </div>
                        <div className="detail-row">
                          Token Standard <span>ERC-1155</span>
                        </div>
                        <div className="detail-row">Blockchain</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="col-md-6">
            <div className="item_info">
              {nft.item_type === "on_auction" && (
                <>
                  Auctions ends in
                  <div className="de_countdown">
                    <Clock deadline={nft.deadline} />
                  </div>
                </>
              )}
              {/* <h2>{nft.title}</h2> */}
              <h2 className="title-col-2">{nft.name}</h2>
              <div className="item_info_counts">
                {/* <div className="item_info_type"><i className="fa fa-image"></i>{nft.category}</div>
                                <div className="item_info_views"><i className="fa fa-eye"></i>{nft.views}</div> */}
                <div className="item_info_owner">
                  Owned by <span>{nft.currentOwner}</span>
                </div>
                <div className="item_info_like">
                  <i className="fa fa-heart"></i>
                  {nft.likes}
                </div>
              </div>
              <div className="tags-container">
                {nft.tags ? (
                  nft.tags.map((tag, index) => (
                    <div key={index} className="tag-box">
                      {tag}
                    </div>
                  ))
                ) : (
                  <div className="tag-box">No tag for this NFT</div>
                )}
              </div>
              {/* <p>{nft.description}</p> */}

              {/* <div className="spacer-40"></div> */}

              <div className="de_tab">
                <div className="de_tab_content">
                  {!nft.listed ? (
                    <div
                      className="list-btn btn-main lead mb-5 mr15"
                      onClick={() =>
                        window.open(`/ItemDetail/${nftId}/listing`, "_self")
                      }
                    >
                      Sell
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-header">
                        Sales ends March 24, 2022 at 5pm CDT
                      </div>
                      <div className="card-body">
                        <p>Current price</p>
                        <div className="current-price">
                          <h2>
                            {nft.price}
                            {nft.useGco ? "GCO" : "MCO"}
                          </h2>
                          <span className="price-in-usd">($61, 208.73)</span>
                        </div>
                        <div className="d-flex flex-row mt-5">
                          <button
                            className="btn-main lead mb-5 mr15"
                            onClick={() => setOpenCheckout(true)}
                          >
                            Buy Now
                          </button>
                          <button
                            className="btn-main btn2 lead mb-5"
                            onClick={() => setOpenCheckoutbid(true)}
                          >
                            Place Bid
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="card">
                    <div
                      className="card-header info-block-header"
                      onClick={() => setOpenPriceHistory(!openPriceHistory)}
                    >
                      <h4>Price History</h4>
                    </div>
                    {openPriceHistory && (
                      <div className="card-body">
                        Chart of the history should be displayed here.
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <div
                      className="card-header info-block-header"
                      onClick={() => setOpenListings(!openListings)}
                    >
                      <h4>Listings</h4>
                    </div>
                    {openListings && (
                      <div className="card-body">
                        {available}/{nft.quantity} Listed
                      </div>
                    )}
                  </div>
                  <div className="card">
                    <div
                      className="card-header info-block-header"
                      onClick={() => setOpenOffers(!openOffers)}
                    >
                      <h4>Offers</h4>
                    </div>
                    {openOffers && (
                      <div className="card-body">
                        the listing of all the offers should be put here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-md-5 pt-md-4">
          <div className="card">
            <div
              className="card-header info-block-header"
              onClick={() => setOpenItemActivity(!openItemActivity)}
            >
              <h4>Item Activity</h4>
            </div>
            {openItemActivity && (
              <div className="card-body">
                all the transactions related to this item
              </div>
            )}
          </div>
        </div>
        <div className="mt-md-5 pt-md-4">
          <div className="card">
            <div
              className="card-header info-block-header"
              onClick={() => setOpenMoreThisCollection(!openMoreThisCollection)}
            >
              <h4>More From This Collection</h4>
            </div>
            {openMoreThisCollection && (
              <div className="card-body">other NFTs in this collection</div>
            )}
          </div>
        </div>
      </section>
      <Footer />
      {openCheckout && (
        <div className="checkout">
          <div className="maincheckout">
            <button
              className="btn-close"
              onClick={() => setOpenCheckout(false)}
            >
              x
            </button>
            <div className="heading">
              <h3>Checkout</h3>
            </div>
            <p>
              You are about to purchase a{" "}
              <span className="bold">
                {nft.name} #{nft.itemId}
              </span>
              <span className="bold"> from Monica Lucas</span>
            </p>
            <div className="detailcheckout mt-4">
              <div className="listcheckout">
                <h6>
                  Enter quantity.
                  <span className="color"> {available} available</span>
                </h6>
                <input
                  type="text"
                  name="buy_now_qty"
                  id="buy_now_qty"
                  className="form-control"
                />
              </div>
            </div>
            <div className="heading mt-3">
              <p>Your balance</p>
              <div className="subtotal">10.67856 ETH</div>
            </div>
            <div className="heading">
              <p>Service fee 2.5%</p>
              <div className="subtotal">0.00325 ETH</div>
            </div>
            <div className="heading">
              <p>You will pay</p>
              <div className="subtotal">0.013325 ETH</div>
            </div>
            <button
              className="btn-main lead mb-5"
              onClick={() => buyNft(nft, library.getSigner(account))}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
      {openCheckoutbid && (
        <div className="checkout">
          <div className="maincheckout">
            <button
              className="btn-close"
              onClick={() => setOpenCheckoutbid(false)}
            >
              x
            </button>
            <div className="heading">
              <h3>Place a Bid</h3>
            </div>
            <p>
              You are about to purchase a{" "}
              <span className="bold">AnimeSailorClub #304</span>
              <span className="bold">from Monica Lucas</span>
            </p>
            <div className="detailcheckout mt-4">
              <div className="listcheckout">
                <h6>Your bid (ETH)</h6>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="detailcheckout mt-3">
              <div className="listcheckout">
                <h6>
                  Enter quantity.
                  <span className="color">10 available</span>
                </h6>
                <input
                  type="text"
                  name="buy_now_qty"
                  id="buy_now_qty"
                  className="form-control"
                />
              </div>
            </div>
            <div className="heading mt-3">
              <p>Your balance</p>
              <div className="subtotal">10.67856 ETH</div>
            </div>
            <div className="heading">
              <p>Service fee 2.5%</p>
              <div className="subtotal">0.00325 ETH</div>
            </div>
            <div className="heading">
              <p>You will pay</p>
              <div className="subtotal">0.013325 ETH</div>
            </div>
            <button
              className="btn-main lead mb-5"
              onClick={() => buyNft(nft, library.getSigner(account))}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ItemDetailRedux);