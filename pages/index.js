import Head from 'next/head';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import ScrollIndicator from '../components/ScrollIndicator';
import ProfilePicture from '../components/ProfilePicture';
import ProjectSlider from '../components/ProjectSlider';

export default function Home() {
  return (
    <>
      <Head>
        <title>douvy</title>
      </Head>
      
      <Nav />
      <ScrollIndicator />
      
      {/* Hero Section */}
      <div className="hero">
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="intro relative">
              <h1 className="name">hello<span className="move">,</span><br/>I'm <em>douvy</em>.</h1>
              <ProfilePicture />
              <div className="clear-both"></div>
              <p>I'm a Frontend Design Architect with 7+ years in crypto who serves as the essential 'designer in the room,' visualizing blockchain concepts and creating intuitive interfaces that prevent broken product development. We can continue to build protocols that are better solutions than financial institutions.</p>
              <p>Actively involved in crypto through trading multiple market cycles, learning, exploring, and posting on crypto twitter.</p>
              <p>I enjoy time with family, technology, guitar, and sports.</p>
              <p>Reach me on <a href="https://twitter.com/douvy_" target="_blank" rel="noreferrer" className="twitter"><i className="fab fa-twitter"></i></a> to connect.</p><br/>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Section */}
      <div id="portfolio" className="section-style">
        {/* dGenesis */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="home-teaser-list w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title mt-10-sm">
                        <h3 className="home-project-title"><a href="https://dgenesis.io/" target="_blank" rel="noreferrer">dGenesis</a></h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">Community-owned generative art.</p>
                      <p className="description">First L2 bridgeable NFT on Arbitrum.</p>
                    </div>
                  </div>
                  <div className="hero-image-home-link-block inline-block">
                    <ProjectSlider 
                      id="dgenesis"
                      images={[
                        { src: "/img/automatons.jpg", id: "automatons", alt: "automatons" },
                        { src: "/img/drips.jpg", id: "drips", alt: "drips" }
                      ]} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BTC Tooling */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="mt-10 sm:mt-24 w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title"><a href="https://btctooling.com/" target="_blank" rel="noreferrer">BTC Tooling</a></h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">A Bitcoin dashboard providing real-time price data, chart, market summary, orderbook, Twitter/X insights and halving countdown data.</p>
                    </div>
                  </div>
                  <div className="hero-image-home-link-block inline-block">
                    <ProjectSlider 
                      id="btctooling"
                      images={[
                        { src: "/img/btc-tooling.jpg", id: "btc-tooling", alt: "BTC Tooling" },
                        { src: "/img/btc-tooling-1.jpg", id: "btc-tooling-alt", alt: "BTC Tooling" }
                      ]} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cantoscan */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="mt-10 sm:mt-24 w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title">Cantoscan</h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">Custom-built Canto blockchain explorer with optimized indexing for real-time transaction, address, and smart contract data. Engineered in two weeks, selected as Grand Prize winner of Canto Hackathon Ch.1, S5.</p>
                    </div>
                  </div>
                  <div className="hero-image-home-link-block inline-block">
                    <ProjectSlider 
                      id="cantoscan"
                      images={[
                        { src: "/img/cantoscan.jpg", id: "cantoscan", alt: "cantoscan" },
                        { src: "/img/cantoscan-1.jpg", id: "cantoscan-1", alt: "cantoscan" }
                      ]} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shishi */}
        <div className="flex flex-col items-center" id="project-last">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="home-teaser-list w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title"><a href="https://shishi520.io/" target="_blank" rel="noreferrer">Shishi</a></h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">Designed and built website for NFT collection in a neochibi aesthetic with randomized traits inspired by net art and fashion trends. Y2K Fashion-Inspired Digital Dolls feature an interactive tool that allows users to customize and swap outfits.</p>
                    </div>
                  </div>
                  <div className="hero-image-home-link-block inline-block">
                    <ProjectSlider 
                      id="shishi"
                      images={[
                        { src: "/img/shishi.jpg", id: "shishi", alt: "shishi" },
                        { src: "/img/shishi-1.jpg", id: "shishi-alt", alt: "shishi" }
                      ]} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}