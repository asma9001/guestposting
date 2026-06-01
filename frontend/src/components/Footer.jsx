import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useWindowSize } from '@/hooks/use-mobile';

const FacebookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16H20L8.267 4z"/>
    <path d="M4 20l6.768-6.768M15.232 9.768 20 4"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export function Footer() {
  const footerRef = useRef(null);
  const { sidebarCollapsed } = useDashboardStore();
  const { isMobile } = useWindowSize();

  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-card border-t border-border transition-all duration-300"
      style={{
        marginLeft: isMobile ? '0px' : sidebarCollapsed ? '80px' : '240px',
        width: isMobile ? '100%' : sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 240px)'
      }}>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Social Media Icons */}
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform duration-300"
            aria-label="Facebook">
              <FacebookIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center hover:scale-110 transition-transform duration-300"
            aria-label="Twitter">
              <TwitterIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center hover:scale-110 transition-transform duration-300"
            aria-label="LinkedIn">
              <LinkedinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </a>
          </div>

          {/* Menu Links */}
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors px-2 py-1">Legal Notice</a>
            <span className="text-border hidden sm:inline">|</span>
            <a href="#" className="hover:text-primary transition-colors px-2 py-1">Terms of Use</a>
            <span className="text-border hidden sm:inline">|</span>
            <a href="#" className="hover:text-primary transition-colors px-2 py-1">Privacy Policy</a>
          </div>

          {/* Copyright */}
          <div className="text-xs sm:text-sm text-muted-foreground text-center">
            © 2025 Contlink. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
