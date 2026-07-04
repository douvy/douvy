import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollIndicator from "@/components/ScrollIndicator";
import ProfilePicture from "@/components/ProfilePicture";
import ProjectCard from "@/components/ProjectCard";
import StripedFrame from "@/components/StripedFrame";
import { useTheme } from "@/contexts/ThemeContext";
import { FILTERS, PROJECTS, type FilterType } from "@/data/projects";

const SOCIAL_SHORTCUTS: Record<string, string> = {
  x: "https://x.com/douvy_",
  g: "https://github.com/douvy",
};

function FilterButton({
  filter,
  isActive,
  onClick,
  theme,
}: {
  filter: FilterType;
  isActive: boolean;
  onClick: (filter: FilterType) => void;
  theme: "dark" | "light";
}): React.ReactElement {
  const borderClass = isActive
    ? theme === "dark"
      ? "border-active-border"
      : "border-filter-active-border"
    : "border-transparent";

  const labelClass = isActive
    ? theme === "dark"
      ? "text-white bg-active-bg md:hover:bg-active-bg-hover"
      : "text-filter-active-text bg-filter-active-bg md:hover:bg-filter-active-bg-hover"
    : theme === "dark"
      ? "text-white bg-transparent hover:bg-[#1f2126]"
      : "text-filter-inactive-text bg-transparent hover:bg-filter-inactive-bg-hover";

  return (
    <button
      onClick={() => onClick(filter)}
      className={`inline-block relative w-auto h-8 rounded-md overflow-hidden border-2 border-solid transition-colors duration-300 ease-in-out -translate-y-0.5 font-vulf ${borderClass}`}
    >
      <span
        className={`flex items-center justify-center w-full h-full px-2 transition-colors duration-300 ease-in-out text-xs font-medium italic ${labelClass}`}
      >
        {filter}
      </span>
      {isActive && (
        <span
          className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors duration-300 ease-in-out ${
            theme === "dark" ? "bg-active-element" : "bg-filter-active-element"
          }`}
        ></span>
      )}
    </button>
  );
}

export default function Home(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [isProfilePictureVisible, setIsProfilePictureVisible] =
    useState<boolean>(true);
  const { theme } = useTheme();

  const visibleProjects = PROJECTS.filter(
    (project) => activeFilter === "All" || project.category === activeFilter,
  );

  // Track hero profile picture visibility so the header milady only shows
  // once it scrolls out of view.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const observeProfilePicture = (): void => {
      const profileContainer = document.querySelector(".hero-image");

      if (!profileContainer) {
        // Container renders client-side; retry until it exists
        setTimeout(observeProfilePicture, 100);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // "Visible" means >60% in view - gives the header milady time to
            // appear while scrolling up, before the profile picture fully shows
            const isVisible =
              entry.isIntersecting && entry.intersectionRatio > 0.6;
            setIsProfilePictureVisible(isVisible);
          });
        },
        {
          rootMargin: "-20px 0px -20px 0px",
          // Fine-grained thresholds for smooth detection around the 60% mark
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        },
      );

      observer.observe(profileContainer);
    };

    observeProfilePicture();

    return () => {
      observer?.disconnect();
    };
  }, []);

  // Keyboard shortcuts for social links
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const url = SOCIAL_SHORTCUTS[event.key.toLowerCase()];
      if (url) {
        window.open(url, "_blank");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
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

      {/* Hero Section */}
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
                <StripedFrame
                  patternId="diagonal-pattern-profile"
                  className="float-right md:mt-[-20px] mt-[-35px] ml-auto order-2 md:order-2"
                >
                  <div
                    className={`relative z-10 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out ${
                      theme === "dark"
                        ? "border-gray-600/40"
                        : "border-gray-400/40"
                    }`}
                  >
                    <ProfilePicture />
                  </div>
                </StripedFrame>
              </div>
              <div className="clear-both w-full"></div>
              <p
                className={`pt-2 mt-4 leading-8 text-[15px] sm:text-[17px] italic ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
              >
                Design engineer with 8+ years in crypto who prototypes and ships
                financial interfaces directly in the browser, from concept
                through production code. We can build protocols that are better
                solutions than financial institutions.
              </p>
              <p
                className={`mt-8 leading-8 text-[15px] sm:text-[17px] italic mb-8 sm:mb-0 ${theme === "dark" ? "text-muted" : "text-[#4c5461]"}`}
              >
                I ship design and code at inference-speed with parallel agents.
                Actively involved in crypto through trading, learning,
                exploring, and posting on Twitter.
              </p>
              <p className="flex items-center flex-wrap mt-10 mb-4">
                <a
                  href="https://x.com/douvy_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block relative w-[118px] h-10 rounded-md overflow-hidden mr-3 ml-0 -mt-1.5 border-2 border-blue-base border-solid transition-colors duration-300 ease-in-out -translate-y-0.5 hover:border-blue-dark font-vulf"
                  aria-label="Twitter Profile - Press the 'x' key as a shortcut"
                >
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
        <div className="flex flex-col items-center">
          <div className="w-full md:w-10/12 lg:w-8/12 px-4">
            <div
              className={`border-t pt-10 sm:pt-10 pb-0 sm:pb-4 -mb-2 sm:mb-0 ${theme === "dark" ? "border-divider" : "border-[#dde9f8]"}`}
            >
              <div className="flex flex-wrap gap-3 justify-start ml-2">
                {FILTERS.map((filter) => (
                  <FilterButton
                    key={filter}
                    filter={filter}
                    isActive={activeFilter === filter}
                    onClick={setActiveFilter}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {visibleProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            isFirstVisible={index === 0}
          />
        ))}
      </div>

      <Footer />
    </>
  );
}
