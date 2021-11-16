import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { NFTAddress, NFTMarketAddress } from './config'
import NFTJson from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarketJson from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState([]);
    const [sold, setSold] = useState([]);
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

        const marketItemsCreated = await NFTMarket.fetchItemsCreated()
        const items = await Promise.all(marketItemsCreated.map(async i => {
            const tokenUri = await NFT.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri); // https://ipfs...
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                itemId: i.itemId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                sold: i.sold,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            return item;
        }))
        // console.log("items: ", items);
        setNfts(items);
        const soldItems = items.filter(i => i.sold)
        // console.log("soldItems: ", soldItems);
        setSold(soldItems);

        setLoadingState('loaded')
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets created</h1>)
    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Created</h2>
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
            <div className="px-4">
                {
                    Boolean(sold.length) && (
                        <div>
                            <h2 className="text-2xl py-2">Items sold</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {
                                    sold.map((nft, i) => (
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
                    )
                }
            </div>
        </div>
    )
}