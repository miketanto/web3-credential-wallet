import React, { Component } from "react";
import Clock from "../template-components/Clock";
import Footer from "../template-components/footer";
import { createGlobalStyle } from "styled-components";
import axios from 'axios'
import { element } from "prop-types";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useState, useEffect } from "react";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import useWalletConnected from "../../hooks/useWalletConnected";
import { mintMarketItem } from "../../utils/nftFunctions";
import { listMarketItem } from "../../utils/nftFunctions";
import { navigate } from "@reach/router";
import { motion } from "framer-motion";
import { useAlert } from "react-alert";
import { useMsal } from '@azure/msal-react'
import { ToggleSwitch } from "../template-components/ToggleSwitch";
import { useSelector, useDispatch } from "react-redux";
import ColumnNewThreeColRedux from "../template-components/ColumnNewThreeColRedux";
import AzureAuthenticationContext from "../../configs/azure-context";
import { erc1155nftaddress } from "../../configs/contracts/contract_config";


const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  .mainside{
    .connect-wal{
      display: none;
    }
    .logout{
      display: flex;
      align-items: center;
    }
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export default function CreatePage() {
  const [fileUrl, setFileUrl] = useState(null);
  const [toList, toggleToList] = useState(false);
  const {accounts, instance}= useMsal();
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
    quantity: "1",
    tags: [],
    price:0,
    royalty:1,
    currency: 'GIES'
  });
  const alert = useAlert();
  const [accessToken, setAccessToken] = useState()
  const [address, setAddress] = useState("")

  const authenticationModule = new AzureAuthenticationContext(instance)

  const request = {
  scopes: ['User.Read'],
  account: accounts[0],
}

const accessTokenCallback = (userAccount) => {
  setAccessToken(userAccount.idTokenClaims.oid)
  getAddress(userAccount.idTokenClaims.oid)
}
const getAddress = async(accessToken)=>{
  const res = await axios.get("https://api.iblockcore.com/user/address", {headers: { Authorization: `Bearer ${accessToken}`}})
  setAddress(res.data.payload.addresses.nftMarket)
  const balanceres = await axios.get("https://api.iblockcore.com/user/balance", {headers: { Authorization: `Bearer ${accessToken}`}})
  console.log(balanceres)
}
  useEffect(() => {
  
  instance.acquireTokenSilent(request)
    .then(async (res) => {
      setAccessToken(res.accessToken)
              console.log('getAccount')
      getAddress(res.accessToken)
    })
    .catch((e) => {
       authenticationModule.login('loginPopup',accessTokenCallback)
  })
}, [])

  const handleShow = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("tab_opt_1").classList.remove("hide");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("btn1").classList.add("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.remove("active");
  };

  const slideList = () =>{
    document.getElementById("toggleSwitch").classList.toggle("list"); 
    console.log(document.getElementById("toggleSwitch").classList);
    toggleToList(!toList)
  }


  async function onFileChange(e) {
    const file = e.target.files[0];
    console.log(file);
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  
  
  const createItemCall = async(name, added, quantity, royalty)=>{
    console.log(address)
    const res = await axios.post("https://api.iblockcore.com/nft/create",{
      name: name ,
      path:added.path,
      collection_id:1,
      quantity:quantity,
      royalty: String(royalty),
      useGco: true,
      listed: false,
      nftContract: erc1155nftaddress,
      creator: address,
      price:0,
    },{
      headers: { Authorization: `Bearer ${accessToken}`, token: accessToken },
    })
    console.log(res)
    return res
  }
  async function createMarketItem(toList) {
    const { name, description, tags,  quantity, price,royalty, currency } = formInput;
    if (!fileUrl) {
      alert.show("Add a File");
      return;
    }
    if (!name) {
      alert.show("Fill in NFT Name");
      return;
    }
    if (!description) {
      alert.show("Add a Description");
      return;
    }
    if (!quantity) {
      alert.show("Add a Quantity");
      return;
    }
    if (price == 0 && toList) {
      alert.show("Need Price To List");
      return;
    }
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      tags,
      image: fileUrl,
      quantity,
    });
    try {
      console.log(toList)
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      loading()
      if(toList){
        console.log('Tolist')
        const response = await createItemCall(name, added, quantity, royalty)
        const itemId = response.data.payload.receipt[0].item_id
        console.log(itemId)
        listMarketItem(itemId,price,currency,quantity).then(()=>navigate('/'));
      }else{
        await createItemCall(name, added, quantity, royalty)
      }


    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  const tags = [
    { name: "Faculty Created", value: "faculty_created" },
    { name: "Merch", value: "merch" },
    { name: "Student Created", value: "student_created" },
    { name: "Art", value: "art" },
    { name: "Photography", value: "photography" },
    { name: "Utility", value: "utility" },
  ];

  const loading = (e) => {
    const load = document.getElementById("submit");
    load.setAttribute("disabled", "disabled");
    load.textContent = "Loading...";
  }

  
  async function listMarketItem(itemId, price, currency,amount) {
    try {
      console.log('Call Func')
      const callParams = {price: price, amount: amount, useGco: true};
      if(currency!="GIES") callParams.useGco = false;
      const res = await axios.post("https://api.iblockcore.com/nft/list",callParams,{
        headers: { Authorization: `Bearer ${accessToken}`, token: accessToken },
        params: {id: itemId}
      })
      console.log(res)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }
  return (
    <div>
      <GlobalStyles />

      <section
        className="jumbotron breadcumb no-bg"
        style={{ backgroundImage: `url(${"./img/background/subheader.jpg"})` }}
      >
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Create NFT</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <form id="form-create-item" className="form-border" action="#">
              <div className="field-set">
                <h5>Upload file</h5>

                <div className="d-create-file">
                  <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>
                  {fileUrl}
                  <div className="browse">
                    <input
                      type="button"
                      id="get_file"
                      className="btn-main"
                      value="Browse"
                    />
                    <input
                      id="upload_file"
                      type="file"
                      multiple
                      onChange={onFileChange}
                    />
                  </div>
                </div>

                <div className="spacer-single"></div>

                <h5>Select method</h5>
                <div className="de_tab tab_methods">
                  <ul className="de_nav">
                    <li id="btn1" className="active" onClick={handleShow}>
                      <span>
                        <i className="fa fa-tag"></i>Fixed price
                      </span>
                    </li>


                    {/*<li id='btn2' onClick={this.handleShow1}><span><i className="fa fa-hourglass-1"></i>Timed auction</span>
                                            </li>
                                            <li id='btn3' onClick={this.handleShow2}><span><i className="fa fa-users"></i>Open for bids</span>
    </li>*/}
                  </ul>

                  <div className="de_tab_content pt-3">
                    {/*<div id="tab_opt_1">
                                                { <h5>Price</h5>
                                                <input type="text" name="item_price" id="item_price" className="form-control" placeholder="enter price for one item (ETH)" /> }
                                          </div>
                                            <div id="tab_opt_2" className='hide'>
                                                <h5>Minimum bid</h5>
                                                <input type="text" name="item_price_bid" id="item_price_bid" className="form-control" placeholder="enter minimum bid" />
                                                <div className="spacer-20"></div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <h5>Starting date</h5>
                                                        <input type="date" name="bid_starting_date" id="bid_starting_date" className="form-control" min="1997-01-01" />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h5>Expiration date</h5>
                                                        <input type="date" name="bid_expiration_date" id="bid_expiration_date" className="form-control" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="tab_opt_3">
  </div>*/}
                  </div>
                </div>

                <div className="spacer-20"></div>

                {/*<div className="switch-with-title">
                                        <h5><i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>Unlock once purchased</h5>
                                        <div className="de-switch">
                                          <input type="checkbox" id="switch-unlock" className="checkbox"/>
                                          {this.state.isActive ?(
                                          <label htmlFor="switch-unlock" onClick={this.unlockHide}></label>
                                          ) : (
                                          <label htmlFor="switch-unlock" onClick={this.unlockClick}></label>
                                          )}
                                        </div>
                                        <div className="clearfix"></div>
                                        <p className="p-info pb-3">Unlock content after successful transaction.</p>
                                        {this.state.isActive ?
                                        <div id="unlockCtn" className="hide-content">
                                            <input type="text" name="item_unlock" id="item_unlock" className="form-control" placeholder="Access key, code to redeem or link to a file..." />             
                                        </div>
                                        : null }
                                    </div>*/}
                
                <div className="spacer-20"></div>

                <h5>Title</h5>
                <input
                  type="text"
                  name="item_title"
                  id="item_title"
                  className="form-control"
                  placeholder="e.g. 'Crypto Funk"
                  onChange={(e) =>
                    updateFormInput({ ...formInput, name: e.target.value })
                  }
                />
                 <div className="spacer-10"></div>

                <h5>Description</h5>
                <textarea
                  data-autoresize
                  name="item_desc"
                  id="item_desc"
                  className="form-control"
                  placeholder="e.g. 'This is very limited item'"
                  onChange={(e) =>
                    updateFormInput({
                      ...formInput,
                      description: e.target.value,
                    })
                  }
                ></textarea>

                <div className="spacer-10"></div>
                
                <h5>Quantity</h5>
                <input
                  type="text"
                  name="item_quantity"
                  id="item_quantity"
                  className="form-control"
                  placeholder="1"
                  onChange={(e) =>
                    updateFormInput({ ...formInput, quantity: e.target.value })
                  }
                />
                <div className="spacer-10"></div>

                <h5>Tags</h5>
                {tags.map((tag, index) => (
                  <div key={index} className="form-check">
                    <input
                      className="form-check-input"
                      name="item_tags"
                      type="checkbox"
                      id={`item_tags_${tag.value}`}
                      value={tag.value}
                      onChange={(e) => {
                        if (e.currentTarget.checked) {
                          updateFormInput({
                            ...formInput,
                            tags: [...formInput.tags, e.target.value],
                          });
                        } else {
                          updateFormInput({
                            ...formInput,
                            tags: formInput.tags.filter(
                              (tag) => tag !== e.target.value
                            ),
                          });
                        }
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`item_tags_${tag.value}`}
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}

               
                <div className="spacer-10"></div>

                <h5>Creator Royalties</h5>
                      <select name="loyalty" id="loyalty" onChange = {(e)=>{updateFormInput({...formInput, royalty: e.target.value}); console.log(e.target.value)}} > 
                        <option value={1}>1%</option>
                        <option value={2}>2%</option>
                        <option value={5}>5%</option>
                        <option value={7}>7%</option>
                        <option value={10}>10%</option>
                      </select>

                <div className="spacer-10"></div>

               
                 <h5>List</h5>                    
                <div class="toggle-switch">
                  <input type="checkbox" class="toggle-switch-checkbox" name="toggleSwitch" id="toggleSwitch" onClick={slideList}/>
                  <label class="toggle-switch-label" for="toggleSwitch">
                    <span class="toggle-switch-inner"></span>
                    <span class="toggle-switch-switch"></span>
                  </label>
                </div>
                <div className="spacer-10"></div>
                {toList && (<div className='row'>
													<div className="col-md-3">
															<select className="form-control" onChange={(e) => updateFormInput({ ...formInput, currency: e.target.value })}>
																	<option value="GIES">GIES</option>
																	<option value="MERCH">MERCH</option>
															</select>
													</div>
													<div className="col-md-9">
															<input type="number" name="item_price" id="item_price" className="form-control" placeholder="Enter price for one item" onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}/>
													</div>
											</div>)}

                <div className="spacer-10"></div>

                <motion.button
                  type="button"
                  id="submit"
                  className={
                     "btn-main"
                  }
                  whileHover={
                   { scale: 1.1 }
                  }
                  whileTap={{ scale: 0.9 }}
                  onClick={
                     ()=>createMarketItem(toList)
                  }
                >
                  Create NFT
                </motion.button>
              </div>
            </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="nft__item m-0">
              {/*<div className="de_countdown">
                        <Clock deadline="December, 30, 2021" />
                      </div>
                      <div className="author_list_pp">
                          <span>                                    
                              <img className="lazy" src="./img/author/author-1.jpg" alt=""/>
                              <i className="fa fa-check"></i>
                          </span>
                      </div>*/}
              <div className="nft__item_wrap">
                <span>
                  <img
                    src={
                      !(fileUrl == null)
                        ? fileUrl
                        : "./img/collections/coll-item-3.jpg"
                    }
                    id="get_file_2"
                    className="lazy nft__item_preview"
                    alt=""
                  />
                </span>
              </div>
              <div className="nft__item_info">
                <span>
                  <h4>{formInput.name ? formInput.name : "Iblock"}</h4>
                </span>
                <div className="nft__item_price">
                  <span className="through">{0} ETH</span> Not Listed
                </div>
                {/*<div className="nft__item_action">
                              <span>Place a bid</span>
                          </div>*/}
                <div className="nft__item_like">
                  <i className="fa fa-heart"></i>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}