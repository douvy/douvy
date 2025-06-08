import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-4 right-4 z-50 w-auto h-8 rounded-md overflow-hidden border-y-2 border-x-2 transition-colors duration-300 ease-in-out font-vulf ${
        theme === 'dark' 
          ? 'border-dark-border hover:border-dark-border-hover'
          : 'border-light-border hover:border-light-border-hover'
      }`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{ right: '1rem', top: '1rem' }}
    >
      {/* Main button content */}
      <span className={`flex items-center justify-center w-full h-full px-2 transition-colors duration-300 ease-in-out ${
        theme === 'dark'
          ? 'text-white bg-dark-bg hover:bg-dark-bg-hover'
          : 'text-light-text bg-light-bg hover:bg-light-bg-hover'
      }`}>
        <span className="text-xs font-medium italic">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      </span>

      {/* Bottom shadow for 3D effect */}
      <span className={`absolute bottom-0 left-0 right-0 h-[2px] transition-colors duration-300 ease-in-out ${
        theme === 'dark' ? 'bg-dark-shadow' : 'bg-light-element'
      }`}></span>
    </button>
  );
}