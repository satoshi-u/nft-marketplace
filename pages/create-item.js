import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { create as ipfsHttppClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttppClient('https://ipfs.infura.io:5001/api/v0');

import { NFTAddress, NFTMarketAddress } from './config'
import NFTJson from '../artifacts/contracts/NFT.sol/NFT.json'
import NFTMarketJson from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreateItem() {
    const [fileURL, setFileURL] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
    const router = useRouter();

    async function onChange(e) {
        const file = e.target.files[0];
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileURL(url);
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createItem() {
        const { name, description, price } = formInput;
        if (!name || !description || !price || !fileURL) return;
        const data = JSON.stringify({
            name, description, image: fileURL
        })

        try {
            const added = await client.add(data);
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            createSale(url);
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    }

    async function createSale(url) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        const NFT = new ethers.Contract(NFTAddress, NFTJson.abi, signer);
        const tx = await NFT.createToken(url);
        const txReceipt = await tx.wait();
        let event = txReceipt.events[0];
        // console.log("event: ", event);
        let value = event.args[2];
        // console.log("value: ", value);
        let tokenId = value.toNumber();
        // console.log("tokenId: ", tokenId);
        // [nftCreatedEvent] = txReceipt.events.filter((x) => { return x.event == "NFTCreated"; });
        // nftCreatedEvent.args.tokenURI

        const price = ethers.utils.parseUnits(formInput.price, 'ether');

        const NFTMarket = new ethers.Contract(NFTMarketAddress, NFTMarketJson.abi, signer);
        const listingPrice = (await NFTMarket.getListingPrice()).toString();
        tx = await NFTMarket.createMarketItem(NFTAddress, tokenId, price, { value: listingPrice });
        txReceipt = await tx.wait();
        router.push('/');
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                />
                {
                    fileURL && (
                        <img className="rounded mt-4" width="350" src={fileURL} />
                    )
                }
                <button onClick={createItem} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create Digital Asset
                </button>
            </div>
        </div>
    )
}