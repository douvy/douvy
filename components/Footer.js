import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-4">
      <div className="flex flex-wrap justify-between mx-auto max-w-screen-xl w-full md:w-10/12 lg:w-8/12 px-4">
        <span> 
          <Link href="#" className="hover:underline"></Link>
        </span>
        <ul className="flex flex-wrap text-right items-center sm:mt-0">
          <li>
            <span className="sm:text-right">
              <h3>douvy</h3> <br />
              <a href="https://twitter.com/douvy_" target="_blank" rel="noreferrer" className="GitHub">twitter</a>
              <a href="https://github.com/douvy" target="_blank" rel="noreferrer" className="GitHub">github</a>
              <a href="mailto:contact@douvy.com">email</a>
            </span>
          </li>
        </ul>
      </div>
    </footer>
  );
}