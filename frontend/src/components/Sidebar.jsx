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

        
      </div>
    </aside>
  );
}