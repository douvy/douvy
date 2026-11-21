import type { ProjectImage } from "@/types";

export const FILTERS = ["All", "AI", "DeFi", "Tools", "NFT"] as const;
export type FilterType = (typeof FILTERS)[number];
export type ProjectCategory = Exclude<FilterType, "All">;

export interface Project {
  id: string;
  name: string;
  url?: string;
  categories: ProjectCategory[];
  /** Each string renders as its own paragraph. */
  description: string[];
  images: ProjectImage[];
  /** The card at the top of the default view sits flush under the filter bar. */
  flushTop?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "blobflow",
    name: "BlobFlow",
    url: "https://blobflow.com/",
    categories: ["Tools", "DeFi"],
    description: [
      "Real-time Ethereum blob analytics. Shows the blob fee and where it's headed next block, which chains are posting the most, and when one flips another.",
    ],
    images: [{ src: "/img/blobflow.jpg", alt: "BlobFlow" }],
    flushTop: true,
  },
  {
    id: "arriba",
    name: "Arriba",
    url: "https://arriba.com/",
    categories: ["DeFi"],
    description: [
      "Crypto trading platform. Trade spot or with leverage, or put money in automated funds paying 5.25% APY. Deposit and withdraw in crypto or fiat, and watch the orderbook update live.",
    ],
    images: [
      { src: "/img/arriba.jpg", alt: "Arriba" },
      { src: "/img/arriba-1.jpg", alt: "Arriba" },
    ],
  },
  {
    id: "how-agents-think",
    name: "How Agents Think",
    url: "https://howagentsthink.com/",
    categories: ["AI"],
    description: [
      "A fun and simple way to follow and actually learn about how an AI agent works. Watch one work through a task, then see what it does when the plan fails or it runs out of memory.",
    ],
    images: [
      {
        src: "/img/how-agents-think.mp4",
        alt: "How Agents Think",
        width: 848,
        height: 464,
      },
    ],
  },
  {
    id: "dgenesis",
    name: "dGenesis",
    url: "https://dgenesis.io/",
    categories: ["NFT"],
    description: [
      "Co-founded a collection of community-owned generative art. It sold out in two hours by word of mouth.",
      "First L2 bridgeable NFT on Arbitrum.",
    ],
    images: [
      { src: "/img/automatons.jpg", alt: "automatons" },
      { src: "/img/drips.jpg", alt: "drips" },
    ],
  },
  {
    id: "cantoscan",
    name: "Cantoscan",
    categories: ["Tools"],
    description: [
      "Won the grand prize at the Canto Hackathon. Built in two weeks. Blockchain explorer that lets you look up any transaction, address, or contract in real time.",
    ],
    images: [
      { src: "/img/cantoscan.jpg", alt: "cantoscan" },
      { src: "/img/cantoscan-1.jpg", alt: "cantoscan" },
    ],
  },
  {
    id: "btctooling",
    name: "BTC Tooling",
    url: "https://btctooling.com/",
    categories: ["Tools"],
    description: [
      "Bitcoin dashboard: live price, orderbook, market summary, halving countdown, Twitter/X sentiment. Pulls from Coinbase, Bitfinex, and Binance over WebSockets, so nothing needs a refresh.",
    ],
    images: [
      { src: "/img/btc-tooling.jpg", alt: "Bitcoin Dashboard" },
      { src: "/img/btc-tooling-1.jpg", alt: "Bitcoin Dashboard" },
    ],
  },
  {
    id: "remilianet",
    name: "RemiliaNET Stats",
    url: "https://remiliastats.com/",
    categories: ["Tools"],
    description: [
      "Social identity platform leaderboard with a profile page for every user. Syncs the full user base in the background, around the API's rate limits. Search and rankings load from Redis.",
    ],
    images: [
      { src: "/img/remilianet-1.jpg", alt: "RemiliaNET" },
      { src: "/img/remilianet-2.jpg", alt: "RemiliaNET" },
    ],
  },
  {
    id: "shishi",
    name: "Shishi",
    url: "https://shishi520.io/",
    categories: ["NFT"],
    description: [
      "Fully hand-crafted site for a neochibi NFT collection. Built an interactive dress-up tool where users swap outfits on their doll and save it as an image. Randomized traits drawn from net art and Y2K fashion.",
    ],
    images: [
      { src: "/img/shishi.jpg", alt: "shishi" },
      { src: "/img/shishi-1.jpg", alt: "shishi" },
    ],
  },
  {
    id: "propix",
    name: "Propix Agent",
    categories: ["AI"],
    description: [
      "I wanted to build my own autonomous AI agent with data I understand well, so it makes NFL/NBA prop picks. Pulls projections, injuries, news, DraftKings lines. Claude synthesizes and only bets when it's confident. Kelly sizing that tightens during drawdowns.",
      "49-30. 62% win rate. +16% ROI.",
    ],
    images: [{ src: "/img/propix.jpg", alt: "Propix Agent" }],
  },
  {
    id: "zaarflip",
    name: "Zaar Flip",
    categories: ["DeFi"],
    description: [
      "Provably fair onchain coin flip game. You pick how many coins to flip and how many have to win, which sets your odds. Turbo mode keeps flipping for you, or you can stake as the house and take the other side.",
    ],
    images: [
      { src: "/img/zaar-flip.jpg", alt: "Zaar Flip" },
      { src: "/img/zaar-flip-1.jpg", alt: "Zaar Flip" },
    ],
  },
];
