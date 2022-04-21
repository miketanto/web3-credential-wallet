import React, { Component } from "react";
import Clock from "../template-components/Clock";
import Footer from '../template-components/footer';
import { createGlobalStyle } from 'styled-components';
import { create as ipfsHttpClient } from 'ipfs-http-client'
import {useState, useEffect} from 'react'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import useWalletConnected from '../../hooks/useWalletConnected'
import { mintMarketItem } from "../../utils/nftFunctions";
import {navigate} from '@reach/router'
import {motion} from 'framer-motion'
import { useAlert } from 'react-alert'
import { listMarketItem, loadMarketNFTs } from "../../utils/nftFunctions";
import { useSelector, useDispatch } from "react-redux";

const GlobalStyles = createGlobalStyle`
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

  .address {
    overflow-wrap: break-word;
    max-width: 100%;
  }
//   .summary-btn {
//       border: none;
//       background-color: #fff;
//       text-align: center
//       margin: 0;
//   }
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
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
export default function ListingPage(props) {
	const [formInput, updateFormInput] = useState({ currency: 'GIES', price: '' });

	const { library, account } = useActiveWeb3React();
	
  const status = useWalletConnected();
  const alert = useAlert();

  const walletAlert = ()=>{
    if(status == "disconnected"){alert.show("Connect Wallet to Create NFT")}
    else{
      alert.show("Change Network to Supported Networks")
    }
  }

  const [nft, setNft] = useState({});

	const handleShowFixedPrice = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("tab_opt_1").classList.remove("hide");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("btnFixedPrice").classList.add("active");
    document.getElementById("btnTimedAuction").classList.remove("active");
	}
	const handleShowTimedAuction = () => {
		document.getElementById("tab_opt_1").classList.add("hide");
		document.getElementById("tab_opt_1").classList.remove("show");
		document.getElementById("tab_opt_2").classList.add("show");
		document.getElementById("btnFixedPrice").classList.remove("active");
		document.getElementById("btnTimedAuction").classList.add("active");
	}

  const dispatch = useDispatch();
  useEffect(async () => {
    const items = await loadMarketNFTs();
    const item = items.filter((item) => item.itemId == props.nftId);
    setNft({ ...item[0], currentOwner: item[0].currentOwner.slice(2, 8) });
    console.log(item);
  }, [dispatch, props.nftId]);

  async function ListMarketItem() {
    const { price,currency } = formInput;
    if (!price) {
      alert.show("Add a Price");
      return;
    }
    try {
      console.log(library, account)
      const lister = library.getSigner(account)
      let useGco = (currency === "GIES")? true:false;
      listMarketItem(nft.itemId, lister,account, formInput.price,useGco).then(() => navigate("/"));
      loading();
    } catch (error) {
      console.log('Error listing NFT: ', error)
    }
  }

  const loading = (e) => {
    const load = document.getElementById("submit");
    load.setAttribute('disabled' , 'disabled');
    load.textContent = "Loading...";
  }

	return (
		<div>
		<GlobalStyles/>

			{/* <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'../../img/background/subheader.jpg'})`}}>
				<div className='mainbreadcumb'>
					<div className='container'>
						<div className='row m-10-hor'>
							<div className='col-12'>
								<h1 className='text-center'>Listing</h1>
							</div>
						</div>
					</div>
				</div>
			</section> */}

			<div className="spacer-60"></div>

			<section className='container'>

			<div className="spacer-30"></div>

			<div className="row">
				<div className="col-lg-7 offset-lg-1 mb-5">
						<form id="form-create-item" className="form-border" action="#">
								<div className="field-set">
										<h2>List item for sale</h2>

										<div className="spacer-single"></div>

										<h5>Type</h5>
											<div className="de_tab tab_methods">
													<ul className="de_nav">
															<li id='btnFixedPrice' className="active" onClick={handleShowFixedPrice}><span><i className="fa fa-tag"></i>Fixed price</span>
															</li>
															<li id='btnTimedAuction' onClick={handleShowTimedAuction}><span><i className="fa fa-hourglass-1"></i>Timed auction</span>
															</li>
													</ul>
													<div className="de_tab_content pt-3">
															<div id="tab_opt_1">
																	<h5>Price</h5>
															</div>
															<div id="tab_opt_2" className='hide'>
																	<h5>Method</h5>
																	<select className="form-control">
																			<option value="Highest bidder">Sell to highest bidder</option>
																			<option value="Declining price">Sell with declining price</option>
																	</select>
																	<div className="spacer-10"></div>
																	<h5>Starting price</h5>
															</div>

															<div id="tab_opt_3">
															</div>
													</div>
											</div>
											<div className='row'>
													<div className="col-md-3">
															<select className="form-control" onChange={(e) => updateFormInput({ ...formInput, currency: e.target.value })}>
																	<option value="GIES">GIES</option>
																	<option value="MERCH">MERCH</option>
															</select>
													</div>
													<div className="col-md-9">
															<input type="text" name="item_price" id="item_price" className="form-control" placeholder="enter price for one item" onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}/>
													</div>
											</div>
											<div className="spacer-10"></div>
										<h5>Duration</h5>
											<div className="row">
													{/* <div className="col-md-6">
															<h5>Starting date</h5>
															<input type="date" name="bid_starting_date" id="bid_starting_date" className="form-control" min="1997-01-01" />
													</div> */}
													<div className="col-md-6">
															<h5>Expiration date</h5>
															<input type="date" name="bid_expiration_date" id="bid_expiration_date" className="form-control" value="7 days"/>
													</div>
											</div>
									<div className="spacer-10"></div>
									{/* <div className="more_options">
											{moreOptions ?
											<div>
													<div className="spacer-30"></div>
													<div className="switch-with-title">
															<h5>Sell as a bundle</h5>
															<div className="de-switch">
																	<input type="checkbox" id="switch-bundle" className="checkbox"/>
																	{bundleOption ? (
																	<label htmlFor="switch-bundle" onClick={updateBundleOption(!bundleOption)}></label>
																	) : (
																	<label htmlFor="switch-bundle" onClick={updateBundleOption(!bundleOption)}></label>
																	)}
															</div>
															<div className="clearfix"></div>
															{bundleOption ?
															<div id="unlockCtn" className="hide-content">
																	<input type="text" name="bundle_name" id="bundle_name" className="form-control" placeholder="Bundle name" />
																	<textarea type="text" name="bundle_description" id="bundle_description" className="form-control" placeholder="Bundle description" />
															</div>
															: null }
													</div>
													<h4 onClick={updateMoreOptions(!moreOptions)}>Fewer options</h4>
											</div> : <h4 className="more_options" onClick={updateMoreOptions(!moreOptions)}>More options</h4>
											}
									</div> */}
                    <hr></hr>
                    <h5>Fees</h5>
                    <div className="row">
                        <div className="col-md-6">Service Fee</div>
                        <div className="col-md-6">2.5%</div>
                    </div>
                    {/* <div className="row">
                        <div className="col-md-6">Creator Fee</div>
                        <div className="col-md-6">5.0%</div>
                    </div> */}
                    <div className="spacer-20"></div>
                    <motion.button type="button" id="submit" className={status == "connected"? "btn-main":"btn-main-blacked"}
                      whileHover={status == "connected"? {scale:1.1}:{scale:1}} 
                      whileTap = {{scale:0.9}}
                      onClick={status == 'connected' ? ListMarketItem: walletAlert }>Complete Listing</motion.button>
                </div>
              </form>
      </div>

      <div className="col-lg-3 col-sm-6 col-xs-12">
              <h5>Preview</h5>
              <div className="nft__item m-0">
                  <div className="nft__item_wrap">
                      <span>
                        <img src={nft.image} id="get_file_2" className="lazy nft__item_preview" alt=""/>
                      </span>
                  </div>
                  <div className="nft__item_info">
                      <span>
                          <h4>{nft.name}</h4>
                      </span>
                      <span>
                        <div className="nft__item_price">
                            {formInput.price} {formInput.currency}
                        </div>
                      </span>

                  </div>
              </div>
          </div>
		</div>

		</section>

			<Footer />
		</div>
	);
}