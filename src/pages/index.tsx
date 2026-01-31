import React, {
  useEffect,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollIndicator from "@/components/ScrollIndicator";
import ProfilePicture from "@/components/ProfilePicture";
import { useTheme } from "@/contexts/ThemeContext";
import type { ProjectImage } from "@/types";

// Dynamic import with loading priority for below-the-fold content
const ProjectSlider = dynamic(() => import("@/components/ProjectSlider"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-gray-800 animate-pulse"></div>
  ),
});

type FilterType = "All" | "DeFi" | "Tools" | "NFT";

// Filter button component
const FilterButton = ({
  filter,
  isActive,
  onClick,
  children,
  theme,
}: {
  filter: FilterType;
  isActive: boolean;
  onClick: (filter: FilterType) => void;
  children: React.ReactNode;
  theme: "dark" | "light";
}) => {
  if (isActive) {
    return (
      <button
        onClick={() => onClick(filter)}
        className={`inline-block relative w-auto h-8 rounded-md overflow-hidden border-2 border-solid transition-colors duration-300 ease-in-out -translate-y-0.5 font-vulf ${
          theme === "dark"
            ? "border-active-border"
            : "border-filter-active-border"
        }`}
      >
        <span
          className={`flex items-center justify-center w-full h-full px-2 transition-colors duration-300 ease-in-out text-xs font-medium italic ${
            theme === "dark"
              ? "text-white bg-active-bg md:hover:bg-active-bg-hover"
              : "text-filter-active-text bg-filter-active-bg md:hover:bg-filter-active-bg-hover"
          }`}
        >
          {children}
        </span>
        <span
          className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors duration-300 ease-in-out ${
            theme === "dark" ? "bg-active-element" : "bg-filter-active-element"
          }`}
        ></span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(filter)}
      className="inline-block relative w-auto h-8 rounded-md overflow-hidden border-2 border-transparent border-solid transition-colors duration-300 ease-in-out -translate-y-0.5 hover:border-transparent font-vulf"
    >
      <span
        className={`flex items-center justify-center w-full h-full px-2 bg-transparent transition-colors duration-300 ease-in-out text-xs font-medium italic ${
          theme === "dark"
            ? "text-white hover:bg-[#1f2126]"
            : "text-filter-inactive-text hover:bg-filter-inactive-bg-hover"
        }`}
      >
        {children}
      </span>
    </button>
  );
};

export default function Home(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [isProfilePictureVisible, setIsProfilePictureVisible] =
    useState<boolean>(true);
  const { theme } = useTheme();

  // Filter button handler
  const handleFilterClick = (filter: FilterType): void => {
    setActiveFilter(filter);
  };

  // Determine which projects to show based on active filter
  const shouldShowProject = (projectType: FilterType): boolean => {
    return activeFilter === "All" || activeFilter === projectType;
  };

  // Check if a project should have reduced top margin (first visible project)
  const isFirstVisibleProject = (projectName: string): boolean => {
    switch (activeFilter) {
      case "All":
        return projectName === "Arriba"; // First project in All view
      case "DeFi":
        return projectName === "Arriba"; // First project in DeFi view
      case "Tools":
        return projectName === "RemiliaNET"; // First project in Tools view
      case "NFT":
        return projectName === "dGenesis"; // First project in NFT view
      default:
        return false;
    }
  };

  // Profile picture visibility observer
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const observeProfilePicture = (): void => {
      // Look for the profile picture container using the same selector strategy as ProfilePicture component
      const profileContainer = document.querySelector(".hero-image");

      if (!profileContainer) {
        // If container not found, retry after a short delay
        setTimeout(observeProfilePicture, 100);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Optimal timing: Profile picture is considered "visible" when more than 60% is in view
            // This gives users more time to see the header milady while scrolling up
            // and ensures the profile picture is substantially visible before header milady hides
            const isVisible =
              entry.isIntersecting && entry.intersectionRatio > 0.6;
            setIsProfilePictureVisible(isVisible);
          });
        },
        {
          // Reduced root margin for more precise timing - header milady appears when profile picture
          // is just starting to leave viewport, disappears when profile picture is well into view
          rootMargin: "-20px 0px -20px 0px",
          // Fine-grained thresholds for smooth detection around the 60% mark
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        },
      );

      observer.observe(profileContainer);
    };

    observeProfilePicture();

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Add hotkey handler for social media buttons
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Check if not inside an input field
      if (
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        )
      ) {
        // Twitter shortcut
        if (event.key === "x" || event.key === "X") {
          window.open("https://x.com/douvy_", "_blank");
        }

        // GitHub shortcut
        if (event.key === "g" || event.key === "G") {
          window.open("https://github.com/douvy", "_blank");
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

      <Header isProfilePictureVisible={isProfilePictureVisible} />
      <ScrollIndicator />

      {/* Hero Section - High Priority Content */}
      <div className="hero px-2.5 mt-36 sm:mt-40 mb-6">
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div className="intro relative">
              <div className="flex flex-row items-start justify-start flex-wrap">
                <h1 className="name max-w-[300px] inline-block order-1 md:order-1 text-[57px] text-highlight leading-[1.3] mb-10">
                  hello<span className="move ml-[3px]">,</span>
                  <br />
                  I'm{" "}
                  <em
                    className={`border-b-2 not-italic ${theme === "dark" ? "border-blue" : "border-[#91c9f5]"}`}
                  >
                    douvy
                  </em>
                  .
                </h1>
                <div
                  className={`relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out float-right md:mt-[-20px] mt-[-35px] ml-auto order-2 md:order-2 ${
                    theme === "dark"
                      ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                  }`}
                >
                  {/* Diagonal stripe pattern background that covers the entire border area */}
                  <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                  <div
                    className={`relative z-10 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out ${
                      theme === "dark"
                        ? "border-gray-600/40"
                        : "border-gray-400/40"
                    }`}
                  >
                    <ProfilePicture />
                  </div>
                </div>
              </div>
              {/* Clear any floats */}
              <div className="clear-both w-full"></div>
              <p
                className={`pt-2 mt-4 leading-8 text-[15px] sm:text-[17px] italic ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
              >
                Pattern-matching AI engineer with 8+ years in crypto, bringing
                the rare ability to visualize concepts and create interfaces
                that prevent broken product development. We can build protocols
                that are better solutions than financial institutions.
              </p>
              <p
                className={`mt-8 leading-8 text-[15px] sm:text-[17px] italic mb-8 sm:mb-0 ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
              >
                I ship design and code with AI agents faster than most teams. Actively involved in crypto through trading,
                learning, exploring, and posting on Twitter.
              </p>
              <p className="flex items-center flex-wrap mt-10 mb-4">
                <a
                  href="https://x.com/douvy_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block relative w-[118px] h-10 rounded-md overflow-hidden mr-3 ml-0 -mt-1.5 border-2 border-blue-base border-solid transition-colors duration-300 ease-in-out -translate-y-0.5 hover:border-blue-dark font-vulf"
                  aria-label="Twitter Profile - Press the 'x' key as a shortcut"
                >
                  {/* Main button content */}
                  <span className="flex items-center justify-between w-full h-full px-2.5 text-white bg-blue-base transition-colors duration-300 ease-in-out hover:bg-blue-dark">
                    <span className="text-sm font-semibold italic">
                      Twitter
                    </span>
                    <span className="flex items-center justify-center w-5 h-5 rounded ml-1 my-0 bg-blue-light border border-blue-highlight">
                      <span className="text-xs font-bold leading-none">X</span>
                    </span>
                  </span>

                  {/* Bottom shadow for 3D effect */}
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-shadow transition-colors duration-300 ease-in-out"></span>
                </a>

                <a
                  href="https://github.com/douvy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block relative w-auto h-10 rounded-md overflow-hidden mx-2 -mt-1.5 border-y-2 border-x-2 border-b-solid transition-colors duration-300 ease-in-out -translate-y-0.5 font-vulf ${
                    theme === "dark"
                      ? "border-dark-border hover:border-dark-border-hover"
                      : "border-light-border hover:border-light-border-hover"
                  }`}
                  aria-label="GitHub Profile - Press the 'g' key as a shortcut"
                >
                  {/* Main button content */}
                  <span
                    className={`flex items-center justify-between w-full h-full px-2.5 transition-colors duration-300 ease-in-out ${
                      theme === "dark"
                        ? "text-white bg-dark-bg hover:bg-dark-bg-hover"
                        : "text-light-text bg-light-bg hover:bg-light-bg-hover"
                    }`}
                  >
                    <span className="text-sm font-semibold italic">GitHub</span>
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded ml-1 my-0 border ${
                        theme === "dark"
                          ? "bg-dark-element border-dark-element-border"
                          : "bg-light-hotkey-bg border-light-element-border"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold leading-none ${
                          theme === "dark" ? "text-white" : "text-light-hotkey"
                        }`}
                      >
                        G
                      </span>
                    </span>
                  </span>

                  {/* Bottom shadow for 3D effect */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors duration-300 ease-in-out ${
                      theme === "dark" ? "bg-dark-shadow" : "bg-light-element"
                    }`}
                  ></span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div id="portfolio" className="section-style">
        {/* Project Filters */}
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div
              className={`border-t pt-10 sm:pt-10 pb-0 sm:pb-4 -mb-2 sm:mb-0 ${theme === "dark" ? "border-divider" : "border-[#dde9f8]"}`}
            >
              <div className="flex flex-wrap gap-3 justify-start ml-2">
                <FilterButton
                  filter="All"
                  isActive={activeFilter === "All"}
                  onClick={handleFilterClick}
                  theme={theme}
                >
                  All
                </FilterButton>
                <FilterButton
                  filter="DeFi"
                  isActive={activeFilter === "DeFi"}
                  onClick={handleFilterClick}
                  theme={theme}
                >
                  DeFi
                </FilterButton>
                <FilterButton
                  filter="Tools"
                  isActive={activeFilter === "Tools"}
                  onClick={handleFilterClick}
                  theme={theme}
                >
                  Tools
                </FilterButton>
                <FilterButton
                  filter="NFT"
                  isActive={activeFilter === "NFT"}
                  onClick={handleFilterClick}
                  theme={theme}
                >
                  NFT
                </FilterButton>
              </div>
            </div>
          </div>
        </div>

        {/* Arriba */}
        {shouldShowProject("DeFi") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div className="w-dyn-list">
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            <a
                              href="https://arriba.com/"
                              target="_blank"
                              rel="noreferrer"
                              className="transition-all duration-250"
                            >
                              Arriba
                            </a>
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          Built a crypto trading platform featuring leverage
                          trading, spot markets, and automated market funds with
                          6% APY. Crypto and fiat deposits and withdrawals.
                          Developed with Next.js, TypeScript, and websockets for
                          live updates.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 sm:mt-0 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
                        <ProjectSlider
                          id="arriba"
                          images={[
                            {
                              src: "/img/arriba.jpg",
                              id: "arriba",
                              alt: "Arriba",
                            },
                            {
                              src: "/img/arriba-1.jpg",
                              id: "arriba-1",
                              alt: "Arriba",
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
        )}

        {/* dGenesis */}
        {shouldShowProject("NFT") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div
                className={`w-dyn-list ${isFirstVisibleProject("dGenesis") ? "mt-12 sm:mt-6" : "mt-16 md:mt-24"}`}
              >
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            dGenesis
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          Co-founded project featuring community-owned
                          generative art that sold out in two hours.
                        </p>
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          First L2 bridgeable NFT on Arbitrum.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 sm:mt-0 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
                        <ProjectSlider
                          id="dgenesis"
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
        )}

        {/* RemiliaNET */}
        {shouldShowProject("Tools") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div
                className={`w-dyn-list ${isFirstVisibleProject("RemiliaNET") ? "mt-12 sm:mt-6" : "mt-16 md:mt-24"}`}
              >
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            <a
                              href="https://remiliastats.com/"
                              target="_blank"
                              rel="noreferrer"
                              className="transition-all duration-250"
                            >
                              RemiliaNET Stats
                            </a>
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          Analytics and leaderboard platform. Real-time
                          statistics, rankings, and detailed user profiles.
                          Built with Next.js, TypeScript, and Tailwind.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 sm:mt-0 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
                        <ProjectSlider
                          id="remilianet"
                          images={[
                            {
                              src: "/img/remilianet-1.jpg",
                              id: "remilianet-1",
                              alt: "RemiliaNET",
                            },
                            {
                              src: "/img/remilianet-2.jpg",
                              id: "remilianet-2",
                              alt: "RemiliaNET",
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
        )}

        {/* Bitcoin Dashboard */}
        {shouldShowProject("Tools") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div
                className={`w-dyn-list ${isFirstVisibleProject("BitcoinDashboard") ? "mt-12 sm:mt-6" : "mt-16 md:mt-24"}`}
              >
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            <a
                              href="https://btctooling.com/"
                              target="_blank"
                              rel="noreferrer"
                              className="transition-all duration-250"
                            >
                              BTC Tooling
                            </a>
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          A Bitcoin dashboard providing real-time price data, a
                          chart, market summary, orderbook, Twitter/X insights
                          and halving countdown data. Built with React, Next.js,
                          TypeScript using CoinGecko and Blockchain.info APIs
                          with WebSockets for real-time updates.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 sm:mt-0 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
                        <ProjectSlider
                          id="btctooling"
                          images={[
                            {
                              src: "/img/btc-tooling.jpg",
                              id: "btc-tooling",
                              alt: "Bitcoin Dashboard",
                            },
                            {
                              src: "/img/btc-tooling-1.jpg",
                              id: "btc-tooling-1",
                              alt: "Bitcoin Dashboard",
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
        )}

        {/* Shishi */}
        {shouldShowProject("NFT") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div
                className={`w-dyn-list ${isFirstVisibleProject("Shishi") ? "mt-12 sm:mt-6" : "mt-16 md:mt-24"}`}
              >
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] mt-4 sm:mt-0 ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            <a
                              href="https://shishi520.io/"
                              target="_blank"
                              rel="noreferrer"
                              className="transition-all duration-250"
                            >
                              Shishi
                            </a>
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          Designed and built website for NFT collection in a
                          neochibi aesthetic with randomized traits inspired by
                          net art and fashion trends. Y2K Fashion-Inspired
                          Digital Dolls feature an interactive tool that allows
                          users to customize and swap outfits.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
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
                              id: "shishi-1",
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
        )}

        {/* Cantoscan */}
        {shouldShowProject("Tools") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div
                className={`w-dyn-list ${isFirstVisibleProject("Cantoscan") ? "mt-12 sm:mt-6" : "mt-16 md:mt-24"}`}
              >
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            Cantoscan
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          Custom-built blockchain explorer with optimized
                          indexing for real-time transaction, address, and smart
                          contract data. Engineered in two weeks, selected as
                          Grand Prize winner of Canto Hackathon Ch.1, S5.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 sm:mt-0 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
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
        )}

        {/* Zaar Flip */}
        {shouldShowProject("DeFi") && (
          <div className="flex flex-col items-center">
            <div className="w-full md:w-10/12 lg:w-8/12 px-4">
              <div
                className={`w-dyn-list ${isFirstVisibleProject("ZaarFlip") ? "mt-12 sm:mt-6" : "mt-16 md:mt-24"}`}
              >
                <div className="project-preview-item w-dyn-item p-0 ml-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
                    <div className="inline-block">
                      <div className="grid">
                        <div className="project-title">
                          <h3
                            className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${theme === "dark" ? "text-highlight border-divider" : "text-[#2250c7] border-[#dde9f8]"}`}
                          >
                            <a
                              href="https://flip.zaar.gg/zaar-flip"
                              target="_blank"
                              rel="noreferrer"
                              className="transition-all duration-250"
                            >
                              Zaar Flip
                            </a>
                          </h3>
                        </div>
                      </div>
                      <div className="project-description mb-4 sm:mb-0">
                        <p
                          className={`description font-lora ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
                        >
                          Designed the first game on Zaar Chain featuring
                          provably fair coin flipping with a twist. Set odds
                          from picking coin count and min. wins needed. Includes
                          Turbo Flip for auto-flipping and "Be The House"
                          staking feature. Built with React, Next.js,
                          TypeScript.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`mr-3 sm:mr-0 mt-4 relative border rounded-sm p-2.5 group overflow-clip transition-all duration-300 ease-in-out ${
                        theme === "dark"
                          ? "border-outline hover:border-[#415b85] dark:shadow-[5px_5px_0_hsla(219,_90%,_60%,_0.15)] dark:hover:!border-blue-400/50 dark:hover:[box-shadow:_6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                          : "border-[#dbdde1] hover:border-[#9ac4fd] hover:shadow-[6px_6px_0_hsla(219,_93%,_60%,_0.15),-6px_-6px_0_hsla(219,_93%,_80%,_0.08)]"
                      }`}
                    >
                      {/* Diagonal stripe pattern background that covers the entire border area */}
                      <div className="absolute inset-0 -z-1 z-[-1] pointer-events-none">
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
                      <div
                        className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                          theme === "dark"
                            ? "border-gray-600/80"
                            : "border-gray-400/60"
                        }`}
                      >
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
        )}
      </div>

      <Footer />
    </>
  );
}
