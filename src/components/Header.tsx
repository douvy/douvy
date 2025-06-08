import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        )
      ) {
        if (event.key === "l" || event.key === "L" || event.key === "d" || event.key === "D") {
          toggleTheme();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleTheme]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out border-b ${
        theme === 'dark' 
          ? 'bg-[#111216] border-[#20252c]'
          : 'bg-[#f5f5f3] border-[#dde9f7]'
      }`}
    >
      <div className="flex justify-center py-4">
        <div className="w-full md:w-10/12 lg:w-8/12 px-4">
          <div className="flex justify-end mr-[8px] sm:mr-0">
            <button
              onClick={toggleTheme}
              className={`inline-block relative w-auto h-8 sm:h-10 rounded-md overflow-hidden border-y-2 border-x-2 border-b-solid transition-colors duration-300 ease-in-out font-vulf ${
                theme === 'dark' 
                  ? 'border-dark-border hover:border-dark-border-hover'
                  : 'border-light-border hover:border-light-border-hover'
              }`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode - Press the '${theme === 'dark' ? 'l' : 'd'}' key as a shortcut`}
            >
              <span className={`flex items-center justify-between w-full h-full px-2 sm:px-2.5 transition-colors duration-300 ease-in-out ${
                theme === 'dark'
                  ? 'text-white bg-dark-bg hover:bg-dark-bg-hover'
                  : 'text-light-text bg-light-bg hover:bg-light-bg-hover'
              }`}>
                <span className="text-[10px] sm:text-xs font-semibold italic">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <span className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded ml-1 my-0 border ${
                  theme === 'dark'
                    ? 'bg-dark-element border-dark-element-border'
                    : 'bg-light-hotkey-bg border-light-element-border'
                }`}>
                  <span className={`text-[10px] sm:text-xs font-bold leading-none ${
                    theme === 'dark' ? 'text-white' : 'text-light-hotkey'
                  }`}>{theme === 'dark' ? 'L' : 'D'}</span>
                </span>
              </span>

              <span className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors duration-300 ease-in-out ${
                theme === 'dark' ? 'bg-dark-shadow' : 'bg-light-element'
              }`}></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}