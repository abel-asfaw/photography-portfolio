import { GitHub } from 'react-feather';

export function Footer() {
  return (
    <footer className="flex justify-center p-8 text-neutral-500">
      <a
        className="duration-300 ease-in hover:text-white"
        aria-label="GitHub portfolio project link"
        href="https://github.com/abel-asfaw/photography-portfolio"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHub size={28} />
      </a>
    </footer>
  );
}
