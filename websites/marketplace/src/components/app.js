import React from 'react';
import { Router, Location, Redirect } from '@reach/router';
import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home1 from './pages/home1';
import Explore2 from './pages/explore2';
import Allnfts from './pages/allnfts';
// import Rangking from './pages/rangking';
import RankingRedux from './pages/RankingRedux';
import Colection from './pages/colection';
// import ItemDetail from './pages/ItemDetail';
import ItemDetailRedux from './pages/ItemDetailRedux';
import Author from './pages/Author';
import Wallet from './pages/wallet';
import Create2 from './pages/create2';
import Create3 from './pages/create3';
import Createoption from './pages/createOptions';
import Activity from './pages/activity';
import News from './pages/news';
import TopCollections from './pages/topCollections';
import Listing from './pages/listing';
import {Helmet} from 'react-helmet'
import { createGlobalStyle } from 'styled-components';
import Web3ReactManager from '../components/Web3ReactManager'
const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const ScrollTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0,0), [location])
  return children
}

const PosedRouter = ({ children }) => (
  <Location>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);

const app= () => (
  <div className="wraper">
  <GlobalStyles />
    <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="description" content="The Disruption Lab at UIUC presents an industry-leading Proof-of-Authority blockchain system with ERC-20 tokens, ERC-1155 NFT marketplace, and innovative dApps." />
        <title>iBlock at UIUC</title>
        <link rel="canonical" href="https://iblockcore.com" />
    </Helmet>
    <Web3ReactManager>
    <Header/>
      <PosedRouter>
      <ScrollTop path="/">
        <Home1 exact path="/">
          <Redirect to="/home1" />
        </Home1>
        <Explore2 path="/explore2" />
        <Allnfts path="/allnfts" />
        <RankingRedux path="/rangking" />
        <Colection path="/profile" />
        <ItemDetailRedux path="/ItemDetail/:nftId" />
        <Wallet path="/wallet" />
        <Create2 path="/create2" />
        <Create3 path="/create3" />
        <Createoption path="/createOptions" />
        <Activity path="/stats/activity" />
        <News path="stats/news" />
        <TopCollections path="/stats/topCollections" />
        <Listing path="/ItemDetail/:nftId/listing" />
        </ScrollTop>
      </PosedRouter>
      </Web3ReactManager>
    <ScrollToTopBtn />
  </div>
);
export default app;