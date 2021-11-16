import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { NFTAddress, NFTMarketAddress } from './config'
import NFTJson from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarketJson from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function MyAssets() {
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(() => {
        loadNFTs();
    }, [])

    async function loadNFTs() {
        const web3Modal = new Web3Modal(); // web browser provider injection MetaMask - write to Ethereum
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const NFTMarket = new ethers.Contract(NFTMarketAddress, NFTMarketJson.abi, signer);
        const NFT = new ethers.Contract(NFTAddress, NFTJson.abi, provider);

        const marketItemsOwned = await NFTMarket.fetchMyNFTs()
        // console.log("marketItemsOwned: ", marketItemsOwned);
        const items = await Promise.all(marketItemsOwned.map(async i => {
            const tokenUri = await NFT.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri); // https://ipfs...
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                itemId: i.itemId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            return item;
        }))
        // console.log("items: ", items);
        setNfts(items);
        setLoadingState('loaded')
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}