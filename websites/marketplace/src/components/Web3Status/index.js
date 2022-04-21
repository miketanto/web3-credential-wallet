import React from 'react'
import {useState, useEffect} from 'react';
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3Modal from "web3modal";
import connected from '../../assets/connected.png'
import useWalletConnected from '../../hooks/useWalletConnected';


function Web3Status() {
    const walletStatus = useWalletConnected()
    const providerOptions = {
        binancechainwallet: {
            package: true
          },
        walletconnect: {
            package: WalletConnectProvider,
          },
          walletlink: {
            package: WalletLink, 
            options: {
              appName: "Net2Dev NFT Minter", 
              rpc: "", 
              chainId: 1337, 
              appLogoUrl: null, 
              darkMode: true 
            }
          },
    };
    useEffect(() => {
      console.log(walletStatus)
    }, [walletStatus])
    
    const web3Modal = new Web3Modal({
        theme: "dark",
        cacheProvider: true,
        providerOptions 
      });
      
    async function toggleMetamaskModal(){
        var provider = await web3Modal.connect();
    }
    return (
        <div>
            {walletStatus == 'disconnected'? 
            (<div  onClick = {toggleMetamaskModal} className = 'connect'>
                  Connect Wallet
            </div>):
            (walletStatus == 'connected'?
                <div className = 'connected'>
                    <div>Wallet Connected</div>
                </div>:
                <div onClick = {toggleMetamaskModal} className = 'wrong-net'>
                    Wrong Network
                </div>)
            }
        </div>
        
        
    )
}

export default Web3Status