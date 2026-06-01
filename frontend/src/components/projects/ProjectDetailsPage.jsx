import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import {
  ArrowLeftIcon,
  LayoutDashboardIcon,
  HistoryIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  EyeIcon,


  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EditIcon,
  SaveIcon,
  TagIcon,
  GlobeIcon,
  LinkIcon,
  TargetIcon,
  ChevronDownIcon,
  EyeOffIcon,
  SparklesIcon,
  Check,
  XIcon } from
'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList } from
"@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import { cn } from "@/lib/utils";






export function ProjectDetailsPage({ projectId, onBack }) {
  const { getProject ,updateProject} = useProjectStore();
  const { orders } = useDashboardStore();
  const project = getProject(projectId);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [sensitiveTopicPopoverOpen, setSensitiveTopicPopoverOpen] = useState(false);
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false);
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [editFormData, setEditFormData] = useState({
    name: project?.name || '',
    targetWebsite: project?.targetWebsite || '',
    categories: project?.categories || [],
    sensitiveTopics: project?.sensitiveTopics || [],
    projectObject: project?.projectObject || '',
    languages: project?.languages || [],
    countries: project?.countries || [],
    publishInstructions: project?.publishInstructions || ''
  });
  console.log("🚀 ProjectDetailsPage rendered with project:", project);
  const [targetPages, setTargetPages] = useState(
    project?.targetPages && project.targetPages.length > 0 ?
    project.targetPages :
    [{ id: '1', anchor: '', url: '' }, { id: '2', anchor: '', url: '' }]
  );

  const MAX_CATEGORY_SENSITIVE = 7;
  const MAX_LANGUAGES = 3;
  const MAX_COUNTRIES = 3;

  const getTotalSelections = () => {
    return editFormData.categories.length + editFormData.sensitiveTopics.length;
  };

  const addTargetPage = () => {
    setTargetPages([...targetPages, { id: Date.now().toString(), anchor: '', url: '' }]);
  };

  const removeTargetPage = (id) => {
    if (targetPages.length > 1) {
      setTargetPages(targetPages.filter((tp) => tp.id !== id));
    }
  };

  const updateTargetPage = (id, field, value) => {
    setTargetPages(targetPages.map((tp) =>
    tp.id === id ? { ...tp, [field]: value } : tp
    ));
  };
const handleEditToggle = async () => {
    if (isEditMode) {
      setIsSaving(true);
      
      // Data compilation dynamically matched with controller structure
      const payload = {
        ...editFormData,
        targetPages: targetPages.map(({ anchor, url }) => ({ anchor, url })) // cleaning up dynamic IDs if backend doesn't need them
      };

      const result = await updateProject(projectId, payload);
      setIsSaving(false);
      
      if (result?.success) {
        setIsEditMode(false);
      } else {
        alert(result?.message || "Failed to update project data.");
      }
    } else {
      setIsEditMode(true);
    }
  };
  if (!project) return <div>Project not found</div>;

  // Filter orders for this project (mock - in real app would filter by projectId)
  const projectOrders = orders.slice(0, 5); // Mock: taking first 5 orders

  // Calculate stats
  const totalOrders = projectOrders.length;
  const activeOrders = projectOrders.filter((o) => o.status === 'processing').length;
  const completedOrders = projectOrders.filter((o) => o.status === 'completed').length;
  const totalSpend = projectOrders.reduce((sum, o) => sum + o.normalPrice + o.writingPrice, 0);
  const pendingAmount = projectOrders.
  filter((o) => o.status === 'processing').
  reduce((sum, o) => sum + o.normalPrice + o.writingPrice, 0);

  // Group orders by status for analytics
  const ordersByStatus = {
    active: projectOrders.filter((o) => o.status === 'processing'),
    completed: projectOrders.filter((o) => o.status === 'completed'),
    cancelled: projectOrders.filter((o) => o.status === 'cancelled')
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'paused':return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':return 'bg-blue-50 text-blue-700 border-blue-200';
      default:return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed':return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':return 'bg-slate-50 text-slate-700 border-slate-200';
      default:return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const canEdit = project.status === 'active';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-accent">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <Badge variant="outline" className={`capitalize ${getStatusColor(project.status)}`}>
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs">PRG-{project._id.substring(project._id.length - 4).toUpperCase()}</span>
              <span>•</span>
              <span>{project.projectObject}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/50 mb-6">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger
              value="overview"
              className="relative bg-transparent border-0 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none transition-all">
              
              <LayoutDashboardIcon className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="relative bg-transparent border-0 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none transition-all">
              
              <HistoryIcon className="w-4 h-4 mr-2" />
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="relative bg-transparent border-0 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:text-primary data-[state=active]:bg-primary/5 data-[state=active]:shadow-none transition-all">
              
              <DollarSignIcon className="w-4 h-4 mr-2" />
              Finance
            </TabsTrigger>
        </TabsList>
        </div>

        {/* TAB 1: Overview - Project Details from Create Form */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="max-w-4xl">
            {/* Edit Button */}
            <div className="flex justify-end mb-2">
              <Button
              onClick={handleEditToggle}
                disabled={isSaving}
                
                variant={isEditMode ? "default" : "outline"}
                className="h-8">
                
                {isEditMode ?
                <>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </> :

                <>
                    <EditIcon className="w-4 h-4 mr-2" />
                    Edit Project
                  </>
                }
              </Button>
            </div>

            {/* Project Basics */}
            <Card className="border border-border/50 overflow-hidden mb-4">
              <div className="bg-muted/30 p-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Project Basics</h2>
                    <p className="text-xs text-muted-foreground">Define your project fundamentals</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Project Name <span className="text-destructive">*</span></Label>
                    {isEditMode ?
                    <Input
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="h-9" /> :


                    <p className="text-sm text-muted-foreground">{project.name}</p>
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Target Website</Label>
                    {isEditMode ?
                    <Input
                      placeholder="https://example.com"
                      value={editFormData.targetWebsite}
                      onChange={(e) => setEditFormData({ ...editFormData, targetWebsite: e.target.value })}
                      className="h-9" /> :


                    <p className="text-sm text-muted-foreground">{project.targetWebsite || 'Not specified'}</p>
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Project Objective</Label>
                  {isEditMode ?
                  <Select
                    value={editFormData.projectObject}
                    onValueChange={(value) => setEditFormData({ ...editFormData, projectObject: value })}>
                    
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="What's your main goal?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase-traffic">🚀 Increase SEO Traffic</SelectItem>
                        <SelectItem value="boost-visibility">👁️ Boost Brand Visibility</SelectItem>
                        <SelectItem value="build-authority">⭐ Build Domain Authority</SelectItem>
                        <SelectItem value="drive-conversions">💰 Drive Conversions</SelectItem>
                        <SelectItem value="improve-rankings">📈 Improve Search Rankings</SelectItem>
                        <SelectItem value="generate-leads">🎯 Generate Leads</SelectItem>
                      </SelectContent>
                    </Select> :

                  <p className="text-sm text-muted-foreground">{project.projectObject}</p>
                  }
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Instructions to Publisher</Label>
                  {isEditMode ?
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editFormData.publishInstructions}
                    onChange={(e) => setEditFormData({ ...editFormData, publishInstructions: e.target.value })} /> :


                  <p className="text-sm text-muted-foreground">{project.publishInstructions || 'No instructions provided'}</p>
                  }
                </div>
              </CardContent>
            </Card>

            {/* Content Targeting */}
            <Card className="border border-border/50 overflow-hidden mb-4">
              <div className="bg-muted/30 p-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <TargetIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Content Targeting</h2>
                    <p className="text-xs text-muted-foreground">Choose your content categories</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Categories</Label>
                  {isEditMode ?
                  <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryPopoverOpen}
                        className={cn(
                          "w-full justify-between min-h-[36px] h-auto px-3 py-2 text-sm font-normal hover:bg-accent/50",
                          editFormData.categories.length === 0 && "text-muted-foreground"
                        )}>
                        
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            <TagIcon className="h-3.5 w-3.5 shrink-0" />
                            {editFormData.categories.length === 0 ?
                          <span className="truncate">Category</span> :

                          <div className="flex flex-wrap gap-1.5 flex-1">
                                {editFormData.categories.map((category) =>
                            <Badge
                              key={category}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 pl-2 pr-1 py-0.5 h-6 text-[11px] font-medium border">
                              
                                    <TagIcon className="w-3 h-3 mr-1 opacity-60" />
                                    {category}
                                    <div
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditFormData({
                                    ...editFormData,
                                    categories: editFormData.categories.filter((c) => c !== category)
                                  });
                                }}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer">
                                
                                      <XIcon className="w-3 h-3" />
                                    </div>
                                  </Badge>
                            )}
                              </div>
                          }
                          </div>
                          <ChevronDownIcon className="h-3 w-3 opacity-50 shrink-0 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search category..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {['Technology', 'Business', 'Health', 'Finance', 'Travel', 'Education', 'Lifestyle', 'Gaming', 'Marketing', 'Fashion', 'Sports', 'Automotive'].map((category) => {
                              const isSelected = editFormData.categories.includes(category);
                              const totalSelections = getTotalSelections();

                              return (
                                <CommandItem
                                  key={category}
                                  value={category}
                                  keywords={[category]}
                                  onSelect={() => {
                                    let newCategories = [...editFormData.categories];

                                    if (isSelected) {
                                      newCategories = newCategories.filter((c) => c !== category);
                                    } else {
                                      if (totalSelections < MAX_CATEGORY_SENSITIVE) {
                                        newCategories = [...newCategories, category];
                                      }
                                    }
                                    setEditFormData({ ...editFormData, categories: newCategories });
                                  }}
                                  disabled={!isSelected && totalSelections >= MAX_CATEGORY_SENSITIVE}
                                  className="cursor-pointer">
                                  
                                    <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                      <Check className="h-3 w-3" />
                                    </div>
                                    <span>{category}</span>
                                  </CommandItem>);

                            })}
                            </CommandGroup>
                          </CommandList>
                          <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
                            {editFormData.categories.length > 0 &&
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditFormData({ ...editFormData, categories: [] });
                            }}
                            className="h-8">
                            
                                Clear Selection
                              </Button>
                          }
                            <span className="text-sm font-medium text-muted-foreground ml-auto px-2">
                              {getTotalSelections()}/{MAX_CATEGORY_SENSITIVE} maximum
                            </span>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover> :

                  <div className="flex flex-wrap gap-2">
                      {project.categories && project.categories.length > 0 ?
                    project.categories.map((cat, i) =>
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {cat}
                          </Badge>
                    ) :

                    <p className="text-sm text-muted-foreground">No categories selected</p>
                    }
                    </div>
                  }
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Sensitive Topics</Label>
                  {isEditMode ?
                  <Popover open={sensitiveTopicPopoverOpen} onOpenChange={setSensitiveTopicPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={sensitiveTopicPopoverOpen}
                        className={cn(
                          "w-full justify-between min-h-[36px] h-auto px-3 py-2 text-sm font-normal hover:bg-accent/50 border-dashed",
                          editFormData.sensitiveTopics.length === 0 && "text-muted-foreground"
                        )}>
                        
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            <EyeOffIcon className="h-3.5 w-3.5 shrink-0" />
                            {editFormData.sensitiveTopics.length === 0 ?
                          <span className="truncate">Sensitive Topics</span> :

                          <div className="flex flex-wrap gap-1.5 flex-1">
                                {editFormData.sensitiveTopics.map((topic) =>
                            <Badge
                              key={topic}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 pl-2 pr-1 py-0.5 h-6 text-[11px] font-medium border">
                              
                                    <EyeOffIcon className="w-3 h-3 mr-1 opacity-60" />
                                    {topic}
                                    <div
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditFormData({
                                    ...editFormData,
                                    sensitiveTopics: editFormData.sensitiveTopics.filter((t) => t !== topic)
                                  });
                                }}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer">
                                
                                      <XIcon className="w-3 h-3" />
                                    </div>
                                  </Badge>
                            )}
                              </div>
                          }
                          </div>
                          <ChevronDownIcon className="h-3 w-3 opacity-50 shrink-0 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search topic..." />
                          <CommandList>
                            <CommandEmpty>No topic found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {['Adult Content', 'Gambling', 'Pharmaceuticals', 'Politics', 'Religion', 'Cryptocurrency', 'CBD', 'Dating', 'Forex'].map((topic) => {
                              const isSelected = editFormData.sensitiveTopics.includes(topic);
                              const totalSelections = getTotalSelections();

                              return (
                                <CommandItem
                                  key={topic}
                                  value={topic}
                                  keywords={[topic]}
                                  onSelect={() => {
                                    let newTopics = [...editFormData.sensitiveTopics];

                                    if (isSelected) {
                                      newTopics = newTopics.filter((t) => t !== topic);
                                    } else {
                                      if (totalSelections < MAX_CATEGORY_SENSITIVE) {
                                        newTopics = [...newTopics, topic];
                                      }
                                    }
                                    setEditFormData({ ...editFormData, sensitiveTopics: newTopics });
                                  }}
                                  disabled={!isSelected && totalSelections >= MAX_CATEGORY_SENSITIVE}
                                  className="cursor-pointer">
                                  
                                    <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-destructive",
                                    isSelected ? "bg-destructive text-destructive-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                      <Check className="h-3 w-3" />
                                    </div>
                                    <span>{topic}</span>
                                  </CommandItem>);

                            })}
                            </CommandGroup>
                          </CommandList>
                          <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
                            {editFormData.sensitiveTopics.length > 0 &&
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditFormData({ ...editFormData, sensitiveTopics: [] });
                            }}
                            className="h-8">
                            
                                Clear Selection
                              </Button>
                          }
                            <span className="text-sm font-medium text-muted-foreground ml-auto px-2">
                              {getTotalSelections()}/{MAX_CATEGORY_SENSITIVE} maximum
                            </span>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover> :

                  <div className="flex flex-wrap gap-2">
                      {project.sensitiveTopics && project.sensitiveTopics.length > 0 ?
                    project.sensitiveTopics.map((topic, i) =>
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {topic}
                          </Badge>
                    ) :

                    <p className="text-sm text-muted-foreground">No sensitive topics selected</p>
                    }
                    </div>
                  }
                </div>
              </CardContent>
            </Card>

            {/* Localization */}
            <Card className="border border-border/50 overflow-hidden mb-4">
              <div className="bg-muted/30 p-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <GlobeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Localization</h2>
                    <p className="text-xs text-muted-foreground">Define your target markets</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Languages</Label>
                  {isEditMode ?
                  <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={languagePopoverOpen}
                        className={cn(
                          "w-full justify-between bg-background h-auto min-h-[44px] px-3 py-2 font-normal hover:bg-accent/50",
                          editFormData.languages.length === 0 && "text-muted-foreground"
                        )}>
                        
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            {editFormData.languages.length === 0 ?
                          <span>Select up to {MAX_LANGUAGES} languages...</span> :

                          <div className="flex flex-wrap gap-1.5 flex-1">
                                {editFormData.languages.map((lang) =>
                            <Badge
                              key={lang}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 pl-2 pr-1 py-0.5 h-6 text-[11px] font-medium border">
                              
                                    {lang}
                                    <div
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditFormData({
                                    ...editFormData,
                                    languages: editFormData.languages.filter((l) => l !== lang)
                                  });
                                }}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer">
                                
                                      <XIcon className="w-3 h-3" />
                                    </div>
                                  </Badge>
                            )}
                              </div>
                          }
                          </div>
                          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search language..." />
                          <CommandList>
                            <CommandEmpty>No language found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese'].map((language) => {
                              const isSelected = editFormData.languages.includes(language);

                              return (
                                <CommandItem
                                  key={language}
                                  value={language}
                                  onSelect={() => {
                                    let newLanguages = [...editFormData.languages];

                                    if (isSelected) {
                                      newLanguages = newLanguages.filter((l) => l !== language);
                                    } else {
                                      if (newLanguages.length < MAX_LANGUAGES) {
                                        newLanguages = [...newLanguages, language];
                                      }
                                    }
                                    setEditFormData({ ...editFormData, languages: newLanguages });
                                  }}
                                  disabled={!isSelected && editFormData.languages.length >= MAX_LANGUAGES}
                                  className="cursor-pointer">
                                  
                                    <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                      <Check className="h-3 w-3" />
                                    </div>
                                    <span>{language}</span>
                                  </CommandItem>);

                            })}
                            </CommandGroup>
                          </CommandList>
                          <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
                            {editFormData.languages.length > 0 &&
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditFormData({ ...editFormData, languages: [] });
                            }}
                            className="h-8">
                            
                                Clear Selection
                              </Button>
                          }
                            <span className="text-sm font-medium text-muted-foreground ml-auto px-2">
                              {editFormData.languages.length}/{MAX_LANGUAGES} selected
                            </span>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover> :

                  <div className="flex flex-wrap gap-2">
                      {project.languages && project.languages.length > 0 ?
                    project.languages.map((lang, i) =>
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {lang}
                          </Badge>
                    ) :

                    <p className="text-sm text-muted-foreground">No languages selected</p>
                    }
                    </div>
                  }
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Target Countries</Label>
                  {isEditMode ?
                  <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryPopoverOpen}
                        className={cn(
                          "w-full justify-between bg-background h-auto min-h-[44px] px-3 py-2 font-normal hover:bg-accent/50",
                          editFormData.countries.length === 0 && "text-muted-foreground"
                        )}>
                        
                          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                            {editFormData.countries.length === 0 ?
                          <span>Select up to {MAX_COUNTRIES} countries...</span> :

                          <div className="flex flex-wrap gap-1.5 flex-1">
                                {editFormData.countries.map((country) =>
                            <Badge
                              key={country}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 pl-2 pr-1 py-0.5 h-6 text-[11px] font-medium border">
                              
                                    {country}
                                    <div
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditFormData({
                                    ...editFormData,
                                    countries: editFormData.countries.filter((c) => c !== country)
                                  });
                                }}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer">
                                
                                      <XIcon className="w-3 h-3" />
                                    </div>
                                  </Badge>
                            )}
                              </div>
                          }
                          </div>
                          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden'].map((country) => {
                              const isSelected = editFormData.countries.includes(country);

                              return (
                                <CommandItem
                                  key={country}
                                  value={country}
                                  onSelect={() => {
                                    let newCountries = [...editFormData.countries];

                                    if (isSelected) {
                                      newCountries = newCountries.filter((c) => c !== country);
                                    } else {
                                      if (newCountries.length < MAX_COUNTRIES) {
                                        newCountries = [...newCountries, country];
                                      }
                                    }
                                    setEditFormData({ ...editFormData, countries: newCountries });
                                  }}
                                  disabled={!isSelected && editFormData.countries.length >= MAX_COUNTRIES}
                                  className="cursor-pointer">
                                  
                                    <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                      <Check className="h-3 w-3" />
                                    </div>
                                    <span>{country}</span>
                                  </CommandItem>);

                            })}
                            </CommandGroup>
                          </CommandList>
                          <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between">
                            {editFormData.countries.length > 0 &&
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditFormData({ ...editFormData, countries: [] });
                            }}
                            className="h-8">
                            
                                Clear Selection
                              </Button>
                          }
                            <span className="text-sm font-medium text-muted-foreground ml-auto px-2">
                              {editFormData.countries.length}/{MAX_COUNTRIES} selected
                            </span>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover> :

                  <div className="flex flex-wrap gap-2">
                      {project.countries && project.countries.length > 0 ?
                    project.countries.map((country, i) =>
                    <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {country}
                          </Badge>
                    ) :

                    <p className="text-sm text-muted-foreground">No countries specified</p>
                    }
                    </div>
                  }
                </div>
              </CardContent>
            </Card>

            {/* Links & Publishing */}
            <Card className="border border-border/50 overflow-hidden">
              <div className="bg-muted/30 p-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Links & Publishing</h2>
                    <p className="text-xs text-muted-foreground">Configure your target pages</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Target Pages</Label>
                  {isEditMode ?
                  <div className="space-y-2">
                      <div className="space-y-1.5">
                        {targetPages.map((tp, index) =>
                      <div key={tp.id} className="flex gap-2 items-start">
                            <div className="flex-1 flex gap-2">
                              <Input
                            placeholder="Anchor text (e.g., Contlinks)"
                            value={tp.anchor}
                            onChange={(e) => updateTargetPage(tp.id, 'anchor', e.target.value)}
                            className="h-9 text-sm flex-1" />
                          
                              <Input
                            placeholder="Target URL (e.g., https://contlinks.com/)"
                            value={tp.url}
                            onChange={(e) => updateTargetPage(tp.id, 'url', e.target.value)}
                            className="h-9 text-sm flex-1" />
                          
                            </div>
                            {targetPages.length > 1 &&
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive shrink-0 h-9 w-9"
                          onClick={() => removeTargetPage(tp.id)}>
                          
                                <XIcon className="w-4 h-4" />
                              </Button>
                        }
                          </div>
                      )}
                      </div>
                      
                      <Button
                      variant="outline"
                      onClick={addTargetPage}
                      className="w-full border-dashed h-9 text-sm">
                      
                        <XIcon className="w-4 h-4 mr-2 rotate-45" />
                        Add Another Target Page
                      </Button>
                    </div> :

                  <div className="space-y-2">
                      {project.targetPages && project.targetPages.length > 0 ?
                    project.targetPages.map((page, i) =>
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border border-border">
                            <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{page.anchor}</p>
                              <p className="text-xs text-muted-foreground truncate">{page.url}</p>
                            </div>
                          </div>
                    ) :

                    <p className="text-sm text-muted-foreground">No target pages configured</p>
                    }
                    </div>
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Order History */}
        <TabsContent value="orders" className="mt-0 space-y-6">
          {/* Orders by Status */}
          {['active', 'completed', 'cancelled'].map((statusKey) => {
            const statusOrders = ordersByStatus[statusKey];
            if (statusOrders.length === 0) return null;

            return (
              <Card key={statusKey} className="border-border shadow-sm">
                <CardHeader className="border-b border-border py-4">
                  <CardTitle className="text-base font-semibold capitalize flex items-center gap-2">
                    {statusKey === 'active' && <ClockIcon className="w-4 h-4 text-amber-600" />}
                    {statusKey === 'completed' && <CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
                    {statusKey === 'cancelled' && <XCircleIcon className="w-4 h-4 text-slate-600" />}
                    {statusKey} Orders ({statusOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/30 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Order ID</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Website Name</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Price</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Order Status</th>
                        <th className="px-6 py-3 font-medium text-muted-foreground">Created Date</th>
                        {statusKey !== 'active' &&
                          <th className="px-6 py-3 font-medium text-muted-foreground">Finished Date</th>
                          }
                        <th className="px-6 py-3 font-medium text-muted-foreground text-right">Action</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {statusOrders.map((order) =>
                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4">
                              <button className="font-mono text-xs text-blue-600 hover:text-blue-700 hover:underline">
                                {order.id}
                              </button>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              <div className="flex items-center gap-2">
                                {order.websiteName}
                                <ExternalLinkIcon className="w-3 h-3 text-muted-foreground" />
                              </div>
                            </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-semibold text-foreground">${order.normalPrice + order.writingPrice}</span>
                              {order.writingPrice > 0 &&
                              <span className="text-sm text-muted-foreground">+ ${order.writingPrice} Writing</span>
                              }
                            </div>
                          </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={`capitalize ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{order.dueDate}</td>
                            {statusKey !== 'active' &&
                          <td className="px-6 py-4 text-muted-foreground">
                                {order.status === 'completed' ? order.dueDate : '-'}
                              </td>
                          }
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                                <EyeIcon className="w-4 h-4 mr-1.5" />
                                View
                              </Button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>);

          })}
        </TabsContent>

        {/* TAB 3: Finance */}
        <TabsContent value="finance" className="mt-0 space-y-6">
          {/* Financial Summary */}
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="bg-muted/30 border-b border-border">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSignIcon className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Financial Overview</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0">Real-time project spending analytics</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs h-6">
                    {totalOrders} Orders
                  </Badge>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-3">
              <div className="grid grid-cols-4 gap-3">
                {/* Total Investment */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Investment</span>
                    </div>
                    <div>
                      <p className="text-base font-normal text-foreground tracking-tight">${totalSpend.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Across {totalOrders} orders</p>
                    </div>
                  </div>
                </div>

                {/* Completed Spend */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Completed</span>
                    </div>
                    <div>
                      <p className="text-base font-normal text-foreground tracking-tight">
                        ${projectOrders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.normalPrice + o.writingPrice, 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{completedOrders} orders delivered</p>
                    </div>
                  </div>
                </div>

                {/* Pending Amount */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Pending</span>
                    </div>
                    <div>
                      <p className="text-base font-normal text-foreground tracking-tight">${pendingAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{activeOrders} in progress</p>
                    </div>
                  </div>
                </div>

                {/* Average Order Value */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Avg. Value</span>
                    </div>
                    <div>
                      <p className="text-base font-normal text-foreground tracking-tight">
                        ${totalOrders > 0 ? Math.round(totalSpend / totalOrders).toLocaleString() : '0'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Per order</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-normal text-muted-foreground">Completion Rate</span>
                  <span className="text-xs font-normal text-foreground">
                    {totalOrders > 0 ? Math.round(completedOrders / totalOrders * 100) : 0}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${totalOrders > 0 ? completedOrders / totalOrders * 100 : 0}%` }} />
                  
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{completedOrders} completed</span>
                  <span className="text-xs text-muted-foreground">{activeOrders} active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spending Chart - Professional Recharts */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border py-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
                <Badge variant="outline" className="text-xs">Last 7 months</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                    { month: 'Jan', amount: 1500 },
                    { month: 'Feb', amount: 1800 },
                    { month: 'Mar', amount: 1200 },
                    { month: 'Apr', amount: 2200 },
                    { month: 'May', amount: 1900 },
                    { month: 'Jun', amount: 2000 },
                    { month: 'Jul', amount: 2400 }]
                    }
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    
                    <defs>
                      <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                      axisLine={false}
                      tickLine={false} />
                    
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`} />
                    
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                      formatter={(value) => [`$${value}`, 'Spending']}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#spendingGradient)"
                      animationDuration={1500}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 7, strokeWidth: 2 }} />
                    
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2 mt-2 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0">Total Spend</p>
                  <p className="text-sm font-medium text-foreground">$12,800</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0">Average</p>
                  <p className="text-sm font-medium text-foreground">$1,829</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0">Peak Month</p>
                  <p className="text-sm font-medium text-foreground">$2,400</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Finance Records */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {projectOrders.length} transactions
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Order ID</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Website</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="px-6 py-3 font-medium text-muted-foreground text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {projectOrders.map((order) => {
                      const totalAmount = order.normalPrice + order.writingPrice;
                      return (
                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4">
                            <button className="font-mono text-xs text-blue-600 hover:text-blue-700 hover:underline">
                              {order.id}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-normal">{order.websiteName}</span>
                              <ExternalLinkIcon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`capitalize ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </td>
                            <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-normal text-foreground">${totalAmount}</span>
                              {order.writingPrice > 0 &&
                              <span className="text-sm text-muted-foreground">+ ${order.writingPrice} writing</span>
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{order.dueDate}</td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10">
                              <EyeIcon className="w-4 h-4 mr-1.5" />
                              Details
                            </Button>
                          </td>
                        </tr>);

                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

}