import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import { NFTAddress, NFTMarketAddress } from './config'
import NFTJson from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarketJson from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  // let rpcEndpoint = null
  // if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  //   rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL
  // }
  const rpc = "https://matic-mumbai.chainstacklabs.com/";

  useEffect(() => {
    loadNFTs();
  }, [])

  async function loadNFTs() {
    // const provider = new ethers.providers.JsonRpcProvider();
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const NFT = new ethers.Contract(NFTAddress, NFTJson.abi, provider);
    const NFTMarket = new ethers.Contract(NFTMarketAddress, NFTMarketJson.abi, provider);
    const marketItemsUnsold = await NFTMarket.fetchMarketItems()

    const items = await Promise.all(marketItemsUnsold.map(async i => {
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

  async function buyNFT(nft) {
    // console.log("nft buy : ", nft)
    const web3Modal = new Web3Modal(); // web browser provider injection MetaMask - write to Ethereum
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const NFTMarket = new ethers.Contract(NFTMarketAddress, NFTMarketJson.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const tx = await NFTMarket.createMarketSale(NFTAddress, nft.itemId, { value: price })
    const txReceipt = await tx.wait();
    loadNFTs();
  }

  if (loadingState === 'loaded' && !nfts.length) return (
    <h1 className='px-20 py-10 text-3xl'>
      No Items In Market Place :(
    </h1>
  )

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1600px' }}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            // console.log("nfts.length in render: ", nfts.length)
          }
          {
            nfts.map((nft, i) => (
              <div key={i} className='border shadow rounded-xl overflow-hidden'>
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} Matic</p>
                  <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div >
  )
}
