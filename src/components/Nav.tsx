import Link from 'next/link';
import React from 'react';

interface NavProps {
  showHomeLink?: boolean;
}

export default function Nav({ showHomeLink = false }: NavProps): React.ReactElement {
  return (
    <div className="absolute top-4 right-2 md:right-6 flex items-center" id="nav">
      <div className="flex">
        {showHomeLink && (
          <Link href="/" className="mx-2 px-5 py-5 text-base font-medium leading-7">
            Home
          </Link>
        )}
      </div>
    </div>
  );
}