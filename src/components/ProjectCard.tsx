import React from "react";
import dynamic from "next/dynamic";
import StripedFrame from "@/components/StripedFrame";
import { useTheme } from "@/contexts/ThemeContext";
import type { Project } from "@/data/projects";

// Below-the-fold content - skip SSR and show a placeholder while loading
const ProjectSlider = dynamic(() => import("@/components/ProjectSlider"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-gray-800 animate-pulse"></div>
  ),
});

interface ProjectCardProps {
  project: Project;
  /** First card visible under the active filter gets reduced top margin. */
  isFirstVisible: boolean;
}

export default function ProjectCard({
  project,
  isFirstVisible,
}: ProjectCardProps): React.ReactElement {
  const { theme } = useTheme();

  const topMargin = isFirstVisible
    ? project.flushTop
      ? ""
      : "mt-12 sm:mt-6"
    : "mt-16 md:mt-24";

  return (
    <div className="flex flex-col items-center">
      <div className="w-full md:w-10/12 lg:w-8/12 px-4">
        <div className={`w-dyn-list ${topMargin}`}>
          <div className="project-preview-item w-dyn-item p-0 ml-2">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:items-center mt-12 sm:mt-0">
              <div className="inline-block">
                <div className="grid">
                  <div className="project-title">
                    <h3
                      className={`home-project-title leading-[38px] border-b pb-3 mr-10 tracking-[1.5px] ${
                        theme === "dark"
                          ? "text-highlight border-divider"
                          : "text-[#2250c7] border-[#dde9f8]"
                      }`}
                    >
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-all duration-250"
                        >
                          {project.name}
                        </a>
                      ) : (
                        project.name
                      )}
                    </h3>
                  </div>
                </div>
                <div className="project-description mb-4 sm:mb-0">
                  {project.description.map((paragraph) => (
                    <p
                      key={paragraph}
                      className={`description font-lora ${
                        theme === "dark" ? "text-muted" : "text-[#4c5461]"
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              <StripedFrame
                patternId={`diagonal-pattern-${project.id}`}
                className="mr-3 sm:mr-0 mt-4 sm:mt-0"
              >
                <div
                  className={`relative z-1 border rounded-[2px] overflow-hidden transition-colors duration-300 ease-in-out leading-[0] text-[0] h-auto ${
                    theme === "dark"
                      ? "border-gray-600/80"
                      : "border-gray-400/60"
                  }`}
                >
                  <ProjectSlider id={project.id} images={project.images} />
                </div>
              </StripedFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
