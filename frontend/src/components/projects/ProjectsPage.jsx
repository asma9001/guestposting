import { useState, useEffect, useRef } from 'react';
import {
  PlusIcon,
  FolderIcon,
  MoreVerticalIcon,
  CalendarIcon,
  ArrowRightIcon,
  LayoutGridIcon,
  ListIcon,
  PieChartIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  CheckIcon } from



'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator } from
"@/components/ui/dropdown-menu";
import { useProjectStore } from '@/stores/projectStore';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';






export function ProjectsPage({ onCreateProject, onViewProject }) {
const { projects, fetchProjects, isLoading, error } = useProjectStore();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [purposeFilter, setPurposeFilter] = useState([]);
  const [languageFilter, setLanguageFilter] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);
useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  console.log("🚀 ProjectsPage rendered with projects:", projects, "isLoading:", isLoading, "error:", error);
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [viewMode]);

  // Get unique values for filters
  const uniquePurposes = Array.from(new Set(projects.map((p) => p.purpose)));
  const uniqueLanguages = Array.from(new Set(projects.map((p) => p.language)));

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);

    // Purpose filter
    const matchesPurpose = purposeFilter.length === 0 || purposeFilter.includes(project.purpose);

    // Language filter
    const matchesLanguage = languageFilter.length === 0 || languageFilter.includes(project.language);

    return matchesSearch && matchesStatus && matchesPurpose && matchesLanguage;
  });

  const activeFilterCount = statusFilter.length + purposeFilter.length + languageFilter.length;

  const toggleFilter = (filterArray, setFilter, value) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter((v) => v !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setPurposeFilter([]);
    setLanguageFilter([]);
    setSearchQuery('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'paused':return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':return 'bg-blue-50 text-blue-700 border-blue-200';
      default:return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your campaigns, track budgets, and monitor performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onCreateProject}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-9 px-4">
              
              <PlusIcon className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 h-9 border border-border shadow-sm w-[380px]">
              <SearchIcon className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects by name, ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground" />
              
              {searchQuery &&
              <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="w-4 h-4" />
                </button>
              }
            </div>
            <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 relative shadow-md hover:shadow-lg transition-all duration-200 border-primary/30 hover:border-primary/50 hover:bg-primary/5 font-semibold bg-white">
                  
                  <FilterIcon className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-primary">Filters</span>
                  {activeFilterCount > 0 &&
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {activeFilterCount}
                    </span>
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0 shadow-lg">
              {/* Header */}
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">Filters</h3>
                {activeFilterCount > 0 &&
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-[10px] font-medium text-primary hover:text-primary hover:bg-primary/10">
                    
                    Clear
                  </Button>
                  }
              </div>

              <div className="p-3 space-y-3 max-h-[320px] overflow-y-auto">
                {/* Status Filter */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-muted-foreground mb-1.5">Status</h4>
                  <div className="space-y-1">
                    {['active', 'paused'].map((status) => {
                        const isSelected = statusFilter.includes(status);
                        const statusConfig = {
                          active: { label: 'Active' },
                          paused: { label: 'Paused' }
                        }[status];

                        return (
                          <button
                            key={status}
                            onClick={() => toggleFilter(statusFilter, setStatusFilter, status)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all",
                              isSelected ?
                              "bg-primary/10 text-primary" :
                              "hover:bg-muted"
                            )}>
                            
                          <div className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center",
                              isSelected ?
                              "bg-primary border-primary" :
                              "border-muted-foreground/30"
                            )}>
                            {isSelected && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs">{statusConfig.label}</span>
                        </button>);

                      })}
                  </div>
                </div>

                <div className="border-t pt-3" />

                {/* Purpose Filter */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-muted-foreground mb-1.5">Purpose</h4>
                  <div className="space-y-1">
                    {uniquePurposes.map((purpose) => {
                        const isSelected = purposeFilter.includes(purpose);
                        return (
                          <button
                            key={purpose}
                            onClick={() => toggleFilter(purposeFilter, setPurposeFilter, purpose)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all",
                              isSelected ?
                              "bg-primary/10 text-primary" :
                              "hover:bg-muted"
                            )}>
                            
                          <div className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center",
                              isSelected ?
                              "bg-primary border-primary" :
                              "border-muted-foreground/30"
                            )}>
                            {isSelected && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs">{purpose}</span>
                        </button>);

                      })}
                  </div>
                </div>

                <div className="border-t pt-3" />

                {/* Language Filter */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-muted-foreground mb-1.5">Language</h4>
                  <div className="space-y-1">
                    {uniqueLanguages.map((language) => {
                        const isSelected = languageFilter.includes(language);
                        return (
                          <button
                            key={language}
                            onClick={() => toggleFilter(languageFilter, setLanguageFilter, language)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all",
                              isSelected ?
                              "bg-primary/10 text-primary" :
                              "hover:bg-muted"
                            )}>
                            
                          <div className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center",
                              isSelected ?
                              "bg-primary border-primary" :
                              "border-muted-foreground/30"
                            )}>
                            {isSelected && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs">{language}</span>
                        </button>);

                      })}
                  </div>
                </div>
              </div>

            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          <div className="flex items-center bg-muted/50 rounded-md p-0.5 border border-border/50 shadow-sm">
          <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1 rounded transition-all",
                viewMode === 'grid' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              
            <LayoutGridIcon className="w-3.5 h-3.5" />
          </button>
          <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1 rounded transition-all",
                viewMode === 'list' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              
            <ListIcon className="w-3.5 h-3.5" />
          </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div ref={containerRef} className={cn(
        "grid gap-3",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {filteredProjects.map((project) => {
          const totalOrders = project.ordersCount || 0;
          const activePercent = totalOrders > 0 ? project.activeOrders / totalOrders * 100 : 0;
          const completedPercent = totalOrders > 0 ? project.completedOrders / totalOrders * 100 : 0;

          return (
            <Card key={project._id} className="group hover:shadow-lg transition-all duration-300 border-border bg-card overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="p-4 pb-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                      <FolderIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground leading-tight line-clamp-1" title={project.name}>
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground">PRG-{project._id.substring(project._id.length - 4).toUpperCase()}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem>View Analytics</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  <Badge variant="outline" className={`capitalize text-[10px] font-medium px-2 py-0.5 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium px-2 py-0.5">
                    {project.languages}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium px-2 py-0.5">
                    {project.projectObject}
                  </Badge>
                </div>

                {/* Finance Section */}
                <div className="px-4 py-3.5 bg-gradient-to-br from-primary/5 to-primary/10 border-t border-border/50">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Total Spend</p>
                      <p className="text-sm font-bold text-foreground tracking-tight">${project.spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">This Month</p>
                      <p className="text-sm font-bold text-foreground tracking-tight">${Math.floor(project.spent * 0.3).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Hold Funds</p>
                      <p className="text-sm font-bold text-amber-600 tracking-tight">${Math.floor(project.spent * (project.activeOrders / Math.max(project.ordersCount, 1))).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Stats Section */}
                <div className="px-4 py-3.5 bg-muted/30 border-t border-border/50">
                  <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Total Orders</p>
                      <p className="text-base font-bold text-foreground tracking-tight">{project.ordersCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Active</p>
                      <p className="text-base font-bold text-blue-600 tracking-tight">{project.activeOrders}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Completed</p>
                      <p className="text-base font-bold text-emerald-600 tracking-tight">{project.completedOrders}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${activePercent}%` }} />
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${completedPercent}%` }} />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-3 border-t border-border/50 flex justify-between items-center bg-card">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] font-medium h-7 px-2.5 shadow-sm"
                    onClick={() => onViewProject?.(project._id)}>
                    
                    <PieChartIcon className="w-3.5 h-3.5 mr-1.5" />
                    View Project
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[11px] font-medium hover:bg-primary/5 hover:text-primary h-7 px-2.5 -mr-1">
                    Go to Catalogue
                    <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </Card>);

        })}

        {/* Add New Project Card */}
        <div
          onClick={onCreateProject}
          className="group border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 min-h-[340px] bg-muted/5 cursor-pointer">
          
          <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-border group-hover:border-primary/30 group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-3">
            <PlusIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-2">Create New Project</h3>
          <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
            Start a new campaign to organize your guest post orders and track your budget effectively.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCreateProject?.();
            }}
            className="mt-4 bg-white hover:bg-white hover:text-primary hover:border-primary/30 shadow-sm h-8 text-xs">
            
            Get Started
          </Button>
        </div>
      </div>
    </div>);

}