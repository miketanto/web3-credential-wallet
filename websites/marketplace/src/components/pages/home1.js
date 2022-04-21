import React from 'react';
import Particle from '../template-components/Particle';
import SliderMainParticle from '../template-components/SliderMainParticle';
import FeatureBox from '../template-components/FeatureBox';
import CarouselCollectionRedux from '../template-components/CarouselCollectionRedux';
import ColumnNewRedux from '../template-components/ColumnNewRedux';
import AuthorListRedux from '../template-components/AuthorListRedux';
import Footer from '../template-components/footer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background:#13294B;
    border-bottom: solid 1px #13294B;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: #fff;
  }
  header#myHeader .logo .d-block{
    display: hidden !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background:#13294B;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;


const homeone= () => (
  <div>
  <GlobalStyles />
      <section className="jumbotron no-bg" style={{backgroundColor:'#13294B'}}>
       <Particle />
         <SliderMainParticle />
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Popular Items</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        
        <ColumnNewRedux/>
        
        
      </section>

      <section className='container-fluid bg-gray'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='text-center'>
              <h2>Create and sell your NFTs</h2>
              <div className="small-border"></div>
            </div>
          </div>
        </div>
        <div className='container'>
          <FeatureBox/>
        </div>
      </section>

    <Footer />

  </div>
);
export default homeone;