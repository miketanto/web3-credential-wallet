import React from 'react';
import { Link } from '@reach/router';

const footer= () => (
  <footer className="footer-light">
            <div className="container" >
                <div className="row">
                    <div className="col-md-3 col-sm-6 col-xs-1">
                        <div className="widget">
                            <h5>Marketplace</h5>
                            <ul >
                                <li><Link to="/allnfts">All NFTs</Link></li>
                                <li><Link to="/create2">Create Single NFT</Link></li>
                                <li><Link to="/create3">Create Multiple NFTs</Link></li>
                                
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-1">
                        <div className="widget">
                            <h5>Resources</h5>
                            <ul>
                                <a target="_blank" href="https://giesgroups.illinois.edu/disruptionlab/home/">About Us</a>
                                <div></div>
                                <a target="_blank" href="https://iblockcore.com/explorer">Iblockcore</a>
                                
                            </ul>
                        </div>
                    </div>
                    
                </div>
            </div>
            <div className="subfooter" style={{zIndex: '1'}}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="de-flex">
                                <div className="de-flex-col">
                                    <span onClick={()=> window.open("", "_self")}>
                                        <img alt="" className="f-logo d-1" src="./img/logo.png" />
                                        <img alt="" className="f-logo d-3" src="./img/logo-2-light.png" />
                                        <img alt="" className="f-logo d-4" src="./img/logo-3.png" />
                                        <span className="copy">&copy; Copyright 2021 - Gigaland by Designesia</span>
                                    </span>
                                </div>
                                <div className="de-flex-col">
                                    <div className="social-icons">
                                        <span onClick={()=> window.open("https://www.instagram.com/uiuc_disruption/", "_self")}><i className="fa fa-instagram fa-lg"></i></span>
                                        <span onClick={()=> window.open("https://www.linkedin.com/company/disruption-lab-at-gies", "_self")}><i className="fa fa-linkedin fa-lg"></i></span>
                                        <span onClick={()=> window.open("https://giesgroups.illinois.edu/disruptionlab/home/", "_self")}><i className="fa fa-rss fa-lg"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
);
export default footer;