import Link from 'next/link'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">NFT MarketPlace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">
              HOME
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink-500">
              SELL DIGITAL ASSET
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">
              MY DIGITAL ASSETS
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">
              CREATOR DASHBOARD
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp

