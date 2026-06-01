import { HomeIcon, PackageIcon, TrendingUpIcon, WalletIcon, HelpCircleIcon, XIcon, GlobeIcon, FolderKanbanIcon } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
// 🟢 FIX 1: Imports ko file ke sabse upar le aaye hain
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MobileMenu({
  onHomeClick,
  onWalletClick,
  onSupportClick,
  onCatalogueClick,
  onMyPortalsClick,
  onSalesClick,
  onPurchasesClick,
  onProjectsClick
}) {
  const { mobileMenuOpen, toggleMobileMenu } = useDashboardStore();
  
  // 🟢 FIX 2: Reactive selectors use kiye hain taaki state change instant catch ho
  const user = useUserStore((state) => state.user);
  const role = useUserStore((state) => state.role);
  
  const menuRef = useRef(null);
  const overlayRef = useRef(null);

  const advertiserNavItems = [
    { icon: HomeIcon, label: 'Home', onClick: 'home' },
    { icon: FolderKanbanIcon, label: 'My Projects', onClick: 'projects' },
    { icon: PackageIcon, label: 'Catalogue', onClick: 'catalogue' },
    { icon: TrendingUpIcon, label: 'Purchases', onClick: 'purchases' },
    { icon: WalletIcon, label: 'Wallet', onClick: 'wallet' },
    { icon: HelpCircleIcon, label: 'Support', onClick: 'support' }
  ];

  const publisherNavItems = [
    { icon: HomeIcon, label: 'Home', onClick: 'home' },
    { icon: GlobeIcon, label: 'My Portals', onClick: 'my-portals' },
    { icon: TrendingUpIcon, label: 'Sales', onClick: 'sales' },
    { icon: WalletIcon, label: 'Wallet', onClick: 'wallet' },
    { icon: HelpCircleIcon, label: 'Support', onClick: 'support' }
  ];

  const navItems = role === 'publisher' ? publisherNavItems : advertiserNavItems;

  useEffect(() => {
    if (mobileMenuOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.2, display: 'block' });
      gsap.to(menuRef.current, { x: 0, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(menuRef.current, { x: -280, duration: 0.3, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, display: 'none', delay: 0.3 });
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (action) => {
    toggleMobileMenu();
    if (!action) return;
    if (action === 'home') onHomeClick?.();
    else if (action === 'wallet') onWalletClick?.();
    else if (action === 'support') onSupportClick?.();
    else if (action === 'catalogue') onCatalogueClick?.();
    else if (action === 'my-portals') onMyPortalsClick?.();
    else if (action === 'sales') onSalesClick?.();
    else if (action === 'purchases') onPurchasesClick?.();
    else if (action === 'projects') onProjectsClick?.();
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
        style={{ display: 'none', opacity: 0 }}
        onClick={toggleMobileMenu} 
      />
      
      {/* Menu Container */}
      <div
        ref={menuRef}
        className="fixed left-0 top-0 h-screen w-[280px] bg-card border-r border-border z-50 lg:hidden flex flex-col"
        style={{ transform: 'translateX(-280px)' }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <h2 className="text-base font-semibold text-foreground">Contlink</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="w-8 h-8 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Close menu"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Card / Role badge */}
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            {/* 🟢 FIX 3: Avatar component structure proper standard mein kar di hai */}
            <Avatar className="w-8 h-8 border border-border flex-shrink-0">
              <AvatarImage
                src={user?.avatar}
                alt="User avatar profile"
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 flex-1">
              {/* 🟢 Name and Role Fallbacks appended properly */}
              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                {user?.fullName || 'John Doe'}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                {user?.role || role || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHome = item.onClick === 'home';
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isHome ?
                  'bg-gradient-to-r from-primary/10 to-tertiary/10 border-l-4 border-primary text-primary font-medium' :
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => handleNavClick(item.onClick)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">© 2025 Contlink · All rights reserved</p>
        </div>
      </div>
    </>
  );
}