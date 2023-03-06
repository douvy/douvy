import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>douvy</title>
        <meta name="description" content="I'm a designer, front-end dev and open-source contributor with 6 years experience in the cryptocurrency space" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta content="douvy · website" property="og:title"/>
        <meta content="https://www.douvy.com/favicon.png" property="og:image"/>
        <meta property='og:image:width' content='512'/>
        <meta property='og:image:width' content='512'/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="hero">
        <div className="flex flex-col items-center ">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="intro">
              <h1 className="name">hello<span className="move">,</span><br />I'm <em>douvy</em>.</h1>
              <img src="pfp.jpg" alt="pfp" />
              <div className="clear-both"></div>
              <p>I'm a designer, front-end dev and open-source contributor with 6 years of crypto experience. We can continue to build protocols that are better solutions than financial institutions.</p>
              <p>Currently building <a href="https://www.dgenesis.io/" target="_blank">dGenesis</a>, <a href="https://cantoscan.xyz/" target="_blank">Cantoscan</a>, and actively involved in crypto through learning, exploring, participating, investing, and trading.</p>
              <p>Hobbies include spending time with family, technology, guitar, sports, and wine.</p>
              <p>Reach out to me on <a href="https://twitter.com/douvy_" target="_blank" className="twitter"><i className="fab fa-twitter"></i></a> to connect.</p><br />
            </div>
          </div>
        </div>
      </div>

      <div id="current-projects" className="section-style">
          <div className="flex flex-col items-center">
              <div className="w-full md:w-10/12 lg:w-8/12 px-4">
                  <div className="standard-container w-container">
                      <div className="home-teaser-list w-dyn-list">
                          <div role="list" className="collection-list w-dyn-items">
                              <div className="project-preview-item w-dyn-item">
                                  <div className="grid grid-cols-1 md:grid-cols-2">
                                      <div className="inline-block">
                                          <div className="grid ">
                                              <div className="project-title mt-10-sm">
                                                  <h3 className="home-project-title"><a href="https://www.dgenesis.io/" target="_blank">dGenesis</a></h3>
                                              </div>
                                          </div>
                                          <div className="project-description">
                                              <p className="description">Community-owned generative art. Br /ought the first L2 br /idgeable NFT to Arbitrum.</p>
                                          </div>
                                      </div>
                                      <div className="hero-image-home-link-block inline-block">
                                          
                                          <div className="swiper-container">
                                              <div className="swiper-wrapper">
                                                  <div className="swiper-slide">
                                                      <img src="automatons.jpg" id="automatons" alt="automatons" />
                                                  </div>
                                              </div>
                                          </div>
                                          
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex flex-col items-center" id="project-2nd">
              <div className="w-full md:w-10/12 lg:w-8/12 px-4">
                  <div className="standard-container w-container">
                      <div className="home-teaser-list w-dyn-list">
                          <div role="list" className="collection-list w-dyn-items">
                              <div className="project-preview-item w-dyn-item">
                                  <div className="grid grid-cols-1 md:grid-cols-2">
                                      <div className="inline-block">
                                          <div className="grid ">
                                              <div className="project-title">
                                                  <h3 className="home-project-title"><a href="https://cantoscan.xyz/" target="_blank">Cantoscan</a></h3>
                                              </div>
                                          </div>
                                          <div className="project-description">
                                              <p className="description">Blockchain explorer for Canto, providing information on transactions, addresses, and smart contracts.</p>
                                              <p className="description">Canto hackathon overall winner Ch. 1, S5.</p>
                                          </div>
                                      </div>
                                      <div className="hero-image-home-link-block inline-block">
                                          
                                          <div className="swiper-container">
                                              <div className="swiper-wrapper">
                                                  <div className="swiper-slide">
                                                      <img src="cantoscan.jpg" id="cantoscan" alt="cantoscan" />
                                                  </div>
                                              </div>
                                          </div>
                                         
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      
      <footer className="py-4">
        <div className="flex flex-wrap justify-between mx-auto max-w-screen-xl w-full md:w-10/12 lg:w-8/12 px-4">
          <span> <a href="#" className="hover:underline"></a>
            
          </span>
          <ul className="flex flex-wrap text-right items-center sm:mt-0">
              <li>
                  <span className="sm:text-right">
                    <h3>douvy</h3> <br />
                    <a href="https://twitter.com/douvy_" target="_blank" className="twitter">twitter</a>
                    <a href="https://github.com/douvy" target="_blank" className="GitHub">github</a>
                    <a href="mailto:itsdouvy@gmail.com">email</a>
                  </span>
              </li>
          </ul>
        </div>
      </footer>
    </>
  )
}
