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
    id: "how-agents-think",
    name: "How Agents Think",
    url: "https://howagentsthink.com/",
    category: "AI",
    description: [
      "Teaches how AI agents work by letting you watch one think. Three hand-scripted runs with a plan, tool calls, inner thoughts, and a memory gauge, on a timeline you can scrub like video.",
      "Each run teaches one lesson: the agentic loop, what happens when a plan fails, and what happens when memory fills up.",
    ],
    images: [{ src: "/img/how-agents-think.mp4", alt: "How Agents Think" }],
    flushTop: true,
  },
  {
    id: "arriba",
    name: "Arriba",
    url: "https://arriba.com/",
    category: "DeFi",
    description: [
      "Crypto trading platform: leverage, spot markets, automated market funds at 5.25% APY. Crypto and fiat deposits and withdrawals, live orderbook over websockets.",
    ],
    images: [
      { src: "/img/arriba.jpg", alt: "Arriba" },
      { src: "/img/arriba-1.jpg", alt: "Arriba" },
    ],
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
      "Analytics and leaderboard for RemiliaNET. Real-time rankings and user profiles.",
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
      "Bitcoin dashboard: live price, orderbook, market summary, halving countdown, Twitter/X sentiment. Streams over WebSockets from CoinGecko and Blockchain.info.",
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
      "Site for a neochibi NFT collection. Built an interactive dress-up tool where users swap outfits on their doll and export the result. Randomized traits drawn from net art and Y2K fashion.",
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
      "Blockchain explorer with real-time transaction, address, and contract indexing. Built in two weeks. Grand Prize, Canto Hackathon Ch.1, S5.",
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
      'First game on Zaar Chain: provably fair coin flips where you set the odds by picking coin count and minimum wins. Turbo Flip for auto-flipping, "Be The House" staking on the other side.',
    ],
    images: [
      { src: "/img/zaar-flip.jpg", alt: "Zaar Flip" },
      { src: "/img/zaar-flip-1.jpg", alt: "Zaar Flip" },
    ],
  },
];
