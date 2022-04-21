import ColumnNewRedux from '../template-components/ColumnNewRedux';
import { createGlobalStyle } from 'styled-components';
import Footer from '../template-components/footer';
import CheckboxFilter from '../template-components/CheckboxFilter';

const GlobalStyles = createGlobalStyle`
.navbar {
  border-bottom: solid 1px rgba(255, 255, 255, .1) !important;
}
`;

const allnfts = () => (
  <div>
    <GlobalStyles/>
    <section className='container'>
      <div className='row'>
        <div className='col-lg-12'>
          <div className='text-center'>
            <h2>All NFTs</h2>
            <div className="small-border"></div>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-3'>
          <CheckboxFilter />
        </div>
        <div className="col-md-9">
          <ColumnNewRedux/>
        </div>
      </div>
      
      
      
    </section>
    <Footer />
  </div>
  
  );
  export default allnfts;