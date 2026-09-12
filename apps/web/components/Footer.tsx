import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest mt-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-margin py-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-low">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-body-sm text-body-sm text-on-surface">
              System Operational
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © 2025 SQM System • Designed, Developed & Built by{" "}
            <a
              href="https://github.com/thedilipsinghh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              thedilipsinghh
            </a>
          </span>
        </div>
        <div className="flex items-center gap-space-md">
          <Link
            href="#"
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Terminal Registry
          </Link>
        </div>
      </div>
    </footer>
  );
}
