import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import NftCard from './NftCard';
import NftMusicCard from './NftMusicCard';
import { useMsal } from '@azure/msal-react'
import { shuffleArray } from '../../store/utils';
import axios from 'axios';

//react functional component
const ColumnNewRedux = ({ showLoadMore = true, shuffle = false, creatorAddress = null }) => {

    const dispatch = useDispatch();
    const nftItems = useSelector(selectors.nftItems);
    const nfts = nftItems ? shuffle ? shuffleArray(nftItems) : nftItems : [];
    //const filterednfts = removeDuplicates(nfts);
    const filterednfts = nftItems
    const [height, setHeight] = useState(0);
    const {accounts, instance}= useMsal();

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }
    
    useEffect(async() => {
        dispatch(actions.fetchNftsBreakdown(creatorAddress));
    }, [dispatch, creatorAddress]);

    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearFilter());
            dispatch(clearNfts());
        }
    },[dispatch]);

    const loadMore = () => {
        dispatch(actions.fetchNftsBreakdown(creatorAddress));
    }

    // transforms nft array to: 1. remove duplicates 2. take the lowest listed nft on the market
    function removeDuplicates (array) {
        const uniqueNFTArray = Object.values(array.reduce((ret, current) => {
            if (!ret[current.tokenId] || current.price < ret[current.tokenId].price && current.price > 0) {
                ret[current.tokenId] = current;
            }

            return ret;
        }, {}))

        return uniqueNFTArray;
    }

    return (
        <div className='row'>
            {filterednfts && filterednfts.map( (nft, index) => (
                <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} />
            ))}
            {showLoadMore && nftItems.length <= 20 &&
                <div className='col-lg-12'>
                    <div className="spacer-single"></div>
                    <span onClick={loadMore} className="btn-main lead m-auto">Load More</span>
                </div>
        }
        </div>              
    );
};

export default memo(ColumnNewRedux);