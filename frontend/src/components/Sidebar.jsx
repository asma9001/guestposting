import { HomeIcon, PackageIcon, TrendingUpIcon, WalletIcon, HelpCircleIcon, ChevronLeftIcon, ChevronRightIcon, GlobeIcon, FolderKanbanIcon, CalendarIcon } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// 🔄 Yahan prop mein "currentView" ko add kiya hai
export function Sidebar({ currentView, onHomeClick, onWalletClick, onSupportClick, onCatalogueClick, onMyPortalsClick, onSalesClick, onPurchasesClick, onProjectsClick }) {
  const { user } = useUserStore();

  // ✅ active properties ko currentView ke mutabiq dynamic kar diya hai
  const advertiserNavItems = [
    { icon: HomeIcon, label: 'Home', active: currentView === 'dashboard', onClick: 'home' },
    { icon: FolderKanbanIcon, label: 'My Projects', active: currentView === 'projects' || currentView === 'project-details' || currentView === 'create-project', onClick: 'projects' },
    { icon: PackageIcon, label: 'Catalogue', active: currentView === 'catalogue' || currentView === 'website-details', onClick: 'catalogue' },
    { icon: TrendingUpIcon, label: 'Purchases', active: currentView === 'purchases', onClick: 'purchases' },
    { icon: WalletIcon, label: 'Wallet', active: currentView === 'wallet', onClick: 'wallet' },
    { icon: HelpCircleIcon, label: 'Support', active: currentView === 'support', onClick: 'support' }
  ];

  const publisherNavItems = [
    { icon: HomeIcon, label: 'Home', active: currentView === 'dashboard', onClick: 'home' },
    { icon: GlobeIcon, label: 'My Portals', active: currentView === 'my-portals' || currentView === 'website-orders', onClick: 'my-portals' },
    { icon: TrendingUpIcon, label: 'Sales', active: currentView === 'sales', onClick: 'sales' },
    { icon: WalletIcon, label: 'Wallet', active: currentView === 'wallet', onClick: 'wallet' },
    { icon: HelpCircleIcon, label: 'Support', active: currentView === 'support', onClick: 'support' }
  ];

  const navItems = user?.role === 'publisher' ? publisherNavItems : advertiserNavItems;

  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: sidebarCollapsed ? '80px' : '240px',
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  }, [sidebarCollapsed]);

  return (
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border z-40 hidden lg:flex flex-col"
      style={{ width: sidebarCollapsed ? '80px' : '240px' }}>
      
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          {!sidebarCollapsed &&
            <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          }
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            
            {sidebarCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const handleClick = () => {
              if (item.onClick === 'home') onHomeClick();
              if (item.onClick === 'wallet') onWalletClick();
              if (item.onClick === 'support') onSupportClick();
              if (item.onClick === 'catalogue') onCatalogueClick();
              if (item.onClick === 'my-portals') onMyPortalsClick();
              if (item.onClick === 'sales') onSalesClick();
              if (item.onClick === 'purchases') onPurchasesClick();
              if (item.onClick === 'projects') onProjectsClick();
            };
            
            const itemClass = `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
              item.active ?
              'bg-gradient-to-r from-primary/10 to-tertiary/10 border-l-4 border-primary text-primary font-medium' :
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`;

            if (sidebarCollapsed) {
              return (
                <Tooltip key={`collapsed-${item.label}`}>
                  <TooltipTrigger asChild>
                    <div onClick={handleClick} className={itemClass}>
                      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    <p className="text-sm">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={`expanded-${item.label}`} onClick={handleClick} className={itemClass}>
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-normal whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Book a Meeting Section - Advertiser Only */}
        {user?.role === 'advertiser' && (
          <div className="border-t border-border">
            {!sidebarCollapsed ? (
              <div className="p-3">
                {/* Manager Card */}
                <div className="flex items-center gap-2.5 mb-3 px-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                      SM
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground leading-tight truncate">Sarah Miller</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">Support Manager</p>
                  </div>
                </div>

                {/* Book a Meeting Button */}
                <button
                  onClick={() => window.open('https://calendly.com', '_blank')}
                  className="w-full flex items-center justify-center gap-2 h-8 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-primary to-tertiary hover:brightness-110 active:brightness-95 transition-all duration-150 shadow-sm">
                  <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  Book a Meeting
                </button>
              </div>
            ) : (
              <div className="p-3 flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white text-[10px] font-semibold shadow-sm">
                    SM
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-card rounded-full"></span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => window.open('https://calendly.com', '_blank')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    <p className="text-sm">Book a Meeting with Sarah</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}