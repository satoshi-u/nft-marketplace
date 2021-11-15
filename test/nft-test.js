/*jshint esversion: 8 */

const { ethers, waffle } = require("hardhat");
const { expect } = require("chai");

let nftMarket;
let nft;
let accounts;
let owner;
let seller;
let buyer;

before(async () => {
  accounts = await ethers.getSigners();
  owner = accounts[0];
  seller = accounts[1];
  buyer = accounts[2];

  const NFTMarket = await ethers.getContractFactory("NFTMarket");
  nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();

  const NFT = await ethers.getContractFactory("NFT");
  nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
})

describe("NFT", function () {
  it('initializes NFT correctly', async function () {
    let _contractAddress = await nft.getNFTMarketAddress();
    // console.log("_contractAddress: ", _contractAddress);
    expect(_contractAddress).to.not.equal(0x0, "NFT doesn't have NFTMarket contractAddress instance correctly initialized!");

    const _listingPrice = await nftMarket.getListingPrice();
    // console.log("_listingPrice: ", _listingPrice.toString());
    expect(_listingPrice.toString()).to.equal("25000000000000000", "incorrect _listingPrice!"); // 0.025 ether
  });

  it('creates tokens in NFT', async function () {
    let tx = await nft.connect(seller).createToken("https://www.myTokenLocation.com");
    let txReceipt = await tx.wait();
    [nftCreatedEventLog] = txReceipt.events.filter((x) => { return x.event == "NFTCreated"; });
    // console.log("nftCreatedEventLog: ", nftCreatedEventLog);
    expect(nftCreatedEventLog.args.tokenURI).to.equal("https://www.myTokenLocation.com", "incorrect tokenURI in NFTCreated Event!");
    expect(nftCreatedEventLog.args.tokenId).to.equal(1, "incorrect tokenId in NFTCreated Event!");

    tx = await nft.connect(seller).createToken("https://www.myTokenLocation2.com");
    txReceipt = await tx.wait();
    [nftCreatedEventLog] = txReceipt.events.filter((x) => { return x.event == "NFTCreated"; });
    // console.log("nftCreatedEventLog: ", nftCreatedEventLog);
    expect(nftCreatedEventLog.args.tokenURI).to.equal("https://www.myTokenLocation2.com", "incorrect tokenURI in NFTCreated Event!");
    expect(nftCreatedEventLog.args.tokenId).to.equal(2, "incorrect tokenId in NFTCreated Event!");
  })
})

describe("NFTMarket", function () {
  it('lists MarketItems in NFTMarket', async function () {
    const listingPrice = (await nftMarket.getListingPrice()).toString(); // 0.025 MATIC
    // console.log("listingPrice: ", listingPrice);
    const auctionPrice = (ethers.utils.parseUnits("100", 'ether')).toString(); // 100 MATIC
    // console.log("auctionPrice: ", auctionPrice);


    let tx = await nftMarket.connect(seller).createMarketItem(nft.address, 1, auctionPrice, { value: listingPrice });
    let txReceipt = await tx.wait();
    [marketItemCreatedEventLog] = txReceipt.events.filter((x) => { return x.event == "MarketItemCreated"; });
    // console.log("marketItemCreatedEventLog: ", marketItemCreatedEventLog);
    expect(marketItemCreatedEventLog.args.tokenId).to.equal(1, "incorrect tokenId in MarketItemCreated Event!");
    expect(marketItemCreatedEventLog.args.itemId).to.equal(1, "incorrect itemId in MarketItemCreated Event!");
    expect(marketItemCreatedEventLog.args.price.toString()).to.equal(auctionPrice, "incorrect price in MarketItemCreated Event!");

    tx = await nftMarket.connect(seller).createMarketItem(nft.address, 2, auctionPrice, { value: listingPrice });
    txReceipt = await tx.wait();
    [marketItemCreatedEventLog] = txReceipt.events.filter((x) => { return x.event == "MarketItemCreated"; });
    // console.log("marketItemCreatedEventLog: ", marketItemCreatedEventLog);
    expect(marketItemCreatedEventLog.args.tokenId).to.equal(2, "incorrect tokenId in MarketItemCreated Event!");
    expect(marketItemCreatedEventLog.args.itemId).to.equal(2, "incorrect itemId in MarketItemCreated Event!");
    expect(marketItemCreatedEventLog.args.price.toString()).to.equal(auctionPrice, "incorrect price in MarketItemCreated Event!");
  })

  it('sells MarketItem in NFTMarket', async function () {
    const auctionPrice = (ethers.utils.parseEther("100")).toString(); // 100 MATIC
    // console.log("auctionPrice: ", auctionPrice);
    let tx = await nftMarket.connect(buyer).createMarketSale(nft.address, 1, { value: auctionPrice }); // alternate way- auction price
    let txReceipt = await tx.wait();
    [marketItemSoldEventLog] = txReceipt.events?.filter((x) => { return x.event == "MarketItemSold" });
    // console.log("marketItemSoldEventLog: ", marketItemSoldEventLog);
    expect(marketItemSoldEventLog.args.tokenId).to.equal(1, "incorrect tokenId in MarketItemSold Event!");
    expect(marketItemSoldEventLog.args.itemId).to.equal(1, "incorrect itemId in MarketItemSold Event!");
    expect(marketItemSoldEventLog.args.price.toString()).to.equal(auctionPrice, "incorrect price in MarketItemSold Event!");
    expect(marketItemSoldEventLog.args.sold).to.equal(true, "incorrect sold bool in MarketItemSold Event!");
  })

  it('fetches Unsold MarketItems in NFTMarket', async function () {
    let marketItemsUnsold = await nftMarket.fetchMarketItems();
    // console.log("marketItemsUnsold: ", marketItemsUnsold);
    expect(marketItemsUnsold.length).to.equal(1, "incorrect number of Unsold MarketItems!");
    expect(marketItemsUnsold[0][0]).to.equal(2, "incorrect itemId1 for Unsold MarketItems!");
  })

  it('fetches MarketItems owned by buyer in NFTMarket', async function () {
    let marketItemsOwned = await nftMarket.connect(buyer).fetchMyNFTs();
    // console.log("marketItemsOwned: ", marketItemsOwned);
    expect(marketItemsOwned.length).to.equal(1, "incorrect number of MarketItems owned by buyer!");
    expect(marketItemsOwned[0][0]).to.equal(1, "incorrect itemId1 for MarketItems owned by buyer!");
  })

  it('fetches MarketItems listed by seller in NFTMarket', async function () {
    let marketItemsCreated = await nftMarket.connect(seller).fetchItemsCreated();
    // console.log("marketItemsCreated: ", marketItemsCreated);
    expect(marketItemsCreated.length).to.equal(2, "incorrect number of MarketItems listed by seller!");
    expect(marketItemsCreated[0][0]).to.equal(1, "incorrect itemId1 for MarketItems listed by seller!");
    expect(marketItemsCreated[1][0]).to.equal(2, "incorrect itemId2 for MarketItems listed by seller!");
    // console.log(Array.isArray(marketItemsCreated))
    // console.log(Array.isArray(marketItemsCreated[0]))
    // marketItemsCreated[0].forEach(function (item, index) {
    //   console.log(typeof item);
    // });
  })
})

