import type { ProjectImage } from "@/types";

export const FILTERS = ["All", "AI", "DeFi", "Tools", "NFT"] as const;
export type FilterType = (typeof FILTERS)[number];
export type ProjectCategory = Exclude<FilterType, "All">;

export interface Project {
  id: string;
  name: string;
  url?: string;
  category: ProjectCategory;
  /** Each string renders as its own paragraph. */
  description: string[];
  images: ProjectImage[];
  /** The card at the top of the default view sits flush under the filter bar. */
  flushTop?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "arriba",
    name: "Arriba",
    url: "https://arriba.com/",
    category: "DeFi",
    description: [
      "Built a crypto trading platform featuring leverage trading, spot markets, and automated market funds with 5.25% APY. Crypto and fiat deposits and withdrawals. Developed with Next.js, TypeScript, and websockets for live updates.",
    ],
    images: [
      { src: "/img/arriba.jpg", alt: "Arriba" },
      { src: "/img/arriba-1.jpg", alt: "Arriba" },
    ],
    flushTop: true,
  },
  {
    id: "dgenesis",
    name: "dGenesis",
    category: "NFT",
    description: [
      "Co-founded project featuring community-owned generative art that sold out in two hours.",
      "First L2 bridgeable NFT on Arbitrum.",
    ],
    images: [
      { src: "/img/automatons.jpg", alt: "automatons" },
      { src: "/img/drips.jpg", alt: "drips" },
    ],
  },
  {
    id: "propix",
    name: "Propix Agent",
    category: "AI",
    description: [
      "Autonomous agent for NFL/NBA prop picks. Pulls projections, injuries, news, DK lines. Claude synthesizes and only bets when it's confident. Kelly sizing that tightens during drawdowns.",
      "49-30. 62% win rate. +16% ROI.",
    ],
    images: [{ src: "/img/propix.jpg", alt: "Propix Agent" }],
  },
  {
    id: "remilianet",
    name: "RemiliaNET Stats",
    url: "https://remiliastats.com/",
    category: "Tools",
    description: [
      "Analytics and leaderboard platform. Real-time statistics, rankings, and detailed user profiles. Built with Next.js, TypeScript, and Tailwind.",
    ],
    images: [
      { src: "/img/remilianet-1.jpg", alt: "RemiliaNET" },
      { src: "/img/remilianet-2.jpg", alt: "RemiliaNET" },
    ],
  },
  {
    id: "btctooling",
    name: "BTC Tooling",
    url: "https://btctooling.com/",
    category: "Tools",
    description: [
      "A Bitcoin dashboard providing real-time price data, a chart, market summary, orderbook, Twitter/X insights and halving countdown data. Built with React, Next.js, TypeScript using CoinGecko and Blockchain.info APIs with WebSockets for real-time updates.",
    ],
    images: [
      { src: "/img/btc-tooling.jpg", alt: "Bitcoin Dashboard" },
      { src: "/img/btc-tooling-1.jpg", alt: "Bitcoin Dashboard" },
    ],
  },
  {
    id: "shishi",
    name: "Shishi",
    url: "https://shishi520.io/",
    category: "NFT",
    description: [
      "Designed and built website for NFT collection in a neochibi aesthetic with randomized traits inspired by net art and fashion trends. Y2K Fashion-Inspired Digital Dolls feature an interactive tool that allows users to customize and swap outfits.",
    ],
    images: [
      { src: "/img/shishi.jpg", alt: "shishi" },
      { src: "/img/shishi-1.jpg", alt: "shishi" },
    ],
  },
  {
    id: "cantoscan",
    name: "Cantoscan",
    category: "Tools",
    description: [
      "Custom-built blockchain explorer with optimized indexing for real-time transaction, address, and smart contract data. Engineered in two weeks, selected as Grand Prize winner of Canto Hackathon Ch.1, S5.",
    ],
    images: [
      { src: "/img/cantoscan.jpg", alt: "cantoscan" },
      { src: "/img/cantoscan-1.jpg", alt: "cantoscan" },
    ],
  },
  {
    id: "zaarflip",
    name: "Zaar Flip",
    url: "https://flip.zaar.gg/zaar-flip",
    category: "DeFi",
    description: [
      'Designed the first game on Zaar Chain featuring provably fair coin flipping with a twist. Set odds from picking coin count and min. wins needed. Includes Turbo Flip for auto-flipping and "Be The House" staking feature. Built with React, Next.js, TypeScript.',
    ],
    images: [
      { src: "/img/zaar-flip.jpg", alt: "Zaar Flip" },
      { src: "/img/zaar-flip-1.jpg", alt: "Zaar Flip" },
    ],
  },
];
