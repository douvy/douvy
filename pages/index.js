import Head from "next/head";
import dynamic from "next/dynamic";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ScrollIndicator from "../components/ScrollIndicator";
import ProfilePicture from "../components/ProfilePicture";

// Dynamic import with loading priority for below-the-fold content
const ProjectSlider = dynamic(() => import("../components/ProjectSlider"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-gray-800 animate-pulse"></div>
  ),
});

export default function Home() {
  return (
    <>
      <Head>
        <title>douvy</title>
        <link
          rel="preload"
          as="style"
          href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"
        />
        <link
          rel="preload"
          as="font"
          href="/fonts/DegularDisplay-Black.woff2"
          crossOrigin=""
        />
      </Head>

      <Nav />
      <ScrollIndicator />

      {/* Hero Section - High Priority Content */}
      <div className="hero">
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="intro relative">
              <div className="relative border default-border-color rounded-sm p-2.5 dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] group overflow-clip dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)] transition-all duration-300 ease-in-out float-right md:mt-[-20px] mt-[-35px]">
                {/* Diagonal stripe pattern background that covers the entire border area */}
                <div className="absolute inset-0 -z-1 pointer-events-none">
                  <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="diagonal-pattern-profile"
                        width="4"
                        height="4"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(45)"
                      >
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="4"
                          stroke="#3B82F6"
                          strokeWidth="1.5"
                          opacity="0.35"
                        ></line>
                      </pattern>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#diagonal-pattern-profile)"
                    ></rect>
                  </svg>
                </div>
                {/* Content container with ProfilePicture */}
                <div className="relative z-10 border dark:border-gray-600/40 rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out">
                  <ProfilePicture />
                </div>
              </div>
              <h1 className="name">
                hello<span className="move">,</span>
                <br />
                I'm <em>douvy</em>.
              </h1>
              <div className="clear-both"></div>
              <p>
                I'm a Frontend Design Architect with 7+ years in crypto who
                serves as the essential 'designer in the room,' visualizing
                blockchain concepts and creating intuitive interfaces that
                prevent broken product development. We can continue to build
                protocols that are better solutions than financial institutions.
              </p>
              <p>
                Actively involved in crypto through trading multiple market
                cycles, learning, exploring, and posting on crypto twitter.
              </p>
              <p>I enjoy time with family, technology, guitar, and sports.</p>
              <p>
                Reach me on{" "}
                <a
                  href="https://twitter.com/douvy_"
                  target="_blank"
                  rel="noreferrer"
                  className="twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>{" "}
                to connect.
              </p>
              <br />
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
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title mt-10-sm">
                        <h3 className="home-project-title">
                          <a
                            href="https://dgenesis.io/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            dGenesis
                          </a>
                        </h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">
                        Co-founded project featuring community-owned generative
                        art that sold out in two hours.
                      </p>
                      <p className="description">
                        First L2 bridgeable NFT on Arbitrum.
                      </p>
                    </div>
                  </div>
                  <div className="mr-3 sm:mr-0 mt-8 sm:mt-0 relative border default-border-color rounded-sm p-2.5 dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] group overflow-clip dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)] transition-all duration-300 ease-in-out">
                    {/* Diagonal stripe pattern background that covers the entire border area */}
                    <div className="absolute inset-0 -z-1 pointer-events-none">
                      <svg
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="diagonal-pattern"
                            width="4"
                            height="4"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="4"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              opacity="0.35"
                            ></line>
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonal-pattern)"
                        ></rect>
                      </svg>
                    </div>
                    {/* Content container with ProjectSlider */}
                    <div className="relative z-1 border dark:border-gray-600/80 rounded-[2px] overflow-clip transition-colors duration-300 ease-in-out">
                      <ProjectSlider
                        id="zaarflip"
                        images={[
                          {
                            src: "/img/automatons.jpg",
                            id: "automatons",
                            alt: "automatons",
                          },
                          {
                            src: "/img/drips.jpg",
                            id: "drips",
                            alt: "drips",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zaar Flip */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="mt-16 sm:mt-24 w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title">
                          <a
                            href="https://flip.zaar.gg/zaar-flip"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Zaar Flip
                          </a>
                        </h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">
                        Designed the first game on Zaar Chain featuring provably
                        fair coin flipping with a twist. Set odds from picking
                        coin count and min. wins needed. Includes Turbo Flip for
                        auto-flipping and "Be The House" staking feature. Built
                        with React, Next.js, TypeScript.
                      </p>
                    </div>
                  </div>
                  <div className="mr-3 sm:mr-0 mt-8 relative border default-border-color rounded-sm p-2.5 dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] group overflow-clip dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)] transition-all duration-300 ease-in-out">
                    {/* Diagonal stripe pattern background that covers the entire border area */}
                    <div className="absolute inset-0 -z-1 pointer-events-none">
                      <svg
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="diagonal-pattern"
                            width="4"
                            height="4"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="4"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              opacity="0.35"
                            ></line>
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonal-pattern)"
                        ></rect>
                      </svg>
                    </div>
                    {/* Content container with ProjectSlider */}
                    <div className="relative z-1 border dark:border-gray-600/80 rounded-[2px] overflow-clip transition-colors duration-300 ease-in-out">
                      <ProjectSlider
                        id="zaarflip"
                        images={[
                          {
                            src: "/img/zaar-flip.jpg",
                            id: "zaar-flip",
                            alt: "Zaar Flip",
                          },
                          {
                            src: "/img/zaar-flip-1.jpg",
                            id: "zaar-flip-1",
                            alt: "Zaar Flip",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BTC Tooling */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="mt-16 sm:mt-24 w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title">
                          <a
                            href="https://btctooling.com/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            BTC Tooling
                          </a>
                        </h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">
                        A Bitcoin dashboard providing real-time price data, a
                        chart, market summary, orderbook, Twitter/X insights and
                        halving countdown data. Built with React, Next.js,
                        TypeScript using CoinGecko and Blockchain.info APIs with
                        WebSockets for real-time updates.
                      </p>
                    </div>
                  </div>
                  <div className="mr-3 sm:mr-0 mt-8 relative border default-border-color rounded-sm p-2.5 dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] group overflow-clip dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)] transition-all duration-300 ease-in-out">
                    {/* Diagonal stripe pattern background that covers the entire border area */}
                    <div className="absolute inset-0 -z-1 pointer-events-none">
                      <svg
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="diagonal-pattern"
                            width="4"
                            height="4"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="4"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              opacity="0.35"
                            ></line>
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonal-pattern)"
                        ></rect>
                      </svg>
                    </div>
                    {/* Content container with ProjectSlider */}
                    <div className="relative z-1 border dark:border-gray-600/80 rounded-[2px] overflow-clip transition-colors duration-300 ease-in-out">
                      <ProjectSlider
                        id="btctooling"
                        images={[
                          {
                            src: "/img/btc-tooling.jpg",
                            id: "btc-tooling",
                            alt: "BTC Tooling",
                          },
                          {
                            src: "/img/btc-tooling-1.jpg",
                            id: "btc-tooling-alt",
                            alt: "BTC Tooling",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cantoscan */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="mt-16 sm:mt-24 w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title">Cantoscan</h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">
                        Custom-built blockchain explorer with optimized indexing
                        for real-time transaction, address, and smart contract
                        data. Engineered in two weeks, selected as Grand Prize
                        winner of Canto Hackathon Ch.1, S5.
                      </p>
                    </div>
                  </div>
                  <div className="mr-3 sm:mr-0 mt-8 relative border default-border-color rounded-sm p-2.5 dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] group overflow-clip dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)] transition-all duration-300 ease-in-out">
                    {/* Diagonal stripe pattern background that covers the entire border area */}
                    <div className="absolute inset-0 -z-1 pointer-events-none">
                      <svg
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="diagonal-pattern"
                            width="4"
                            height="4"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="4"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              opacity="0.35"
                            ></line>
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonal-pattern)"
                        ></rect>
                      </svg>
                    </div>
                    {/* Content container with ProjectSlider */}
                    <div className="relative z-1 border dark:border-gray-600/80 rounded-[2px] overflow-clip transition-colors duration-300 ease-in-out">
                      <ProjectSlider
                        id="cantoscan"
                        images={[
                          {
                            src: "/img/cantoscan.jpg",
                            id: "cantoscan",
                            alt: "cantoscan",
                          },
                          {
                            src: "/img/cantoscan-1.jpg",
                            id: "cantoscan-1",
                            alt: "cantoscan",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shishi */}
        <div className="flex flex-col items-center" id="project-last">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="home-teaser-list mt-16 sm:mt-24 w-dyn-list">
              <div className="project-preview-item w-dyn-item">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center">
                  <div className="inline-block">
                    <div className="grid">
                      <div className="project-title">
                        <h3 className="home-project-title">
                          <a
                            href="https://shishi520.io/"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Shishi
                          </a>
                        </h3>
                      </div>
                    </div>
                    <div className="project-description">
                      <p className="description">
                        Designed and built website for NFT collection in a
                        neochibi aesthetic with randomized traits inspired by
                        net art and fashion trends. Y2K Fashion-Inspired Digital
                        Dolls feature an interactive tool that allows users to
                        customize and swap outfits.
                      </p>
                    </div>
                  </div>
                  <div className="mr-3 sm:mr-0 mt-8 relative border default-border-color rounded-sm p-2.5 dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] group overflow-clip dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)] transition-all duration-300 ease-in-out">
                    {/* Diagonal stripe pattern background that covers the entire border area */}
                    <div className="absolute inset-0 -z-1 pointer-events-none">
                      <svg
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <pattern
                            id="diagonal-pattern"
                            width="4"
                            height="4"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)"
                          >
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="4"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                              opacity="0.35"
                            ></line>
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#diagonal-pattern)"
                        ></rect>
                      </svg>
                    </div>
                    {/* Content container with ProjectSlider */}
                    <div className="relative z-1 border dark:border-gray-600/80 rounded-[2px] overflow-clip transition-colors duration-300 ease-in-out">
                      <ProjectSlider
                        id="shishi"
                        images={[
                          {
                            src: "/img/shishi.jpg",
                            id: "shishi",
                            alt: "shishi",
                          },
                          {
                            src: "/img/shishi-1.jpg",
                            id: "shishi-alt",
                            alt: "shishi",
                          },
                        ]}
                      />
                    </div>
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
