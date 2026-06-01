import { useState,useEffect } from 'react';
import axios from 'axios';
import {
  SearchIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  StarIcon,
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckIcon,
  FilterIcon,
  DollarSignIcon,
  ActivityIcon,
  BarChart3Icon,
  UsersIcon,
  GlobeIcon,
  LanguagesIcon,
  TagIcon,
  XIcon,
  EyeOffIcon,
  SlidersHorizontalIcon,
  PenToolIcon,
  LinkIcon,
  HashIcon,
  MegaphoneIcon,
  LayoutTemplateIcon,
  HeartIcon,
  PercentIcon,
  CalendarIcon,
  AwardIcon,
  ZapIcon,
  ShieldIcon } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { RequestWebsiteModal } from './RequestWebsiteModal';
import api from '../../lib/api';
import { useCartStore } from '../../stores/cartStore';

const RangeFilter = ({ label, icon: Icon, prefix = "", suffix = "", min = 0, max, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const hasValue = minValue || maxValue;

  const handleReset = (e) => {
    e.stopPropagation();
    setMinValue("");
    setMaxValue("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed font-medium justify-between",
            hasValue ?
            "border-solid bg-primary/5 border-primary/20 text-primary hover:bg-primary/10" :
            "border-border text-muted-foreground hover:text-foreground",
            className
          )}>
          
          <div className="flex items-center gap-2 truncate">
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span className="truncate">{label}</span>
            {hasValue &&
            <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <span className="font-medium text-foreground truncate">
                  {prefix}{minValue || min}{suffix} - {prefix}{maxValue || (max ? max : "∞")}{suffix}
                </span>
              </>
            }
          </div>
          {hasValue ?
          <div
            role="button"
            onClick={handleReset}
            className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors shrink-0">
            
               <XIcon className="h-3 w-3" />
             </div> :

          <ChevronDownIcon className="ml-2 h-3 w-3 opacity-50 shrink-0" />
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-foreground leading-none">{label} Range</h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Min</label>
              <div className="relative">
                {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{prefix}</span>}
                <Input
                  type="number"
                  placeholder={min.toString()}
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  className={cn("h-7 text-xs px-2", prefix && "pl-5")} />
                
              </div>
            </div>
            <span className="text-muted-foreground mt-4">-</span>
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Max</label>
              <div className="relative">
                {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{prefix}</span>}
                <Input
                  type="number"
                  placeholder={max ? max.toString() : "Any"}
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className={cn("h-7 text-xs px-2", prefix && "pl-5")} />
                
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
             <Button variant="ghost" size="sm" onClick={() => {setMinValue("");setMaxValue("");setIsOpen(false);}} className="h-6 text-[10px] px-2">Reset</Button>
             <Button size="sm" onClick={() => setIsOpen(false)} className="h-6 text-[10px] px-2 bg-primary text-primary-foreground hover:bg-primary/90">Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>);

};

const FilterSelect = ({
  options,
  placeholder,
  value,
  onChange,
  icon: Icon,
  max = 3,
  className








}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const hasSelection = value.length > 0 && !value.includes('all');

  const handleSelect = (optionValue) => {
    if (optionValue === 'all') {
      onChange(['all']);
      return;
    }
    const isSelected = value.includes(optionValue);
    let newValues = value.filter((v) => v !== 'all');
    if (isSelected) {
      newValues = newValues.filter((v) => v !== optionValue);
      if (newValues.length === 0) newValues = ['all'];
    } else {
      if (newValues.length < max) {
        newValues = [...newValues, optionValue];
      }
    }
    onChange(newValues);
  };

  const filtered = options.filter((o) =>
  o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = value.
  filter((v) => v !== 'all').
  map((v) => options.find((o) => o.value === v)?.label ?? v);

  return (
    <Popover open={open} onOpenChange={(v) => {setOpen(v);if (!v) setSearch('');}}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 border-dashed font-medium justify-between min-w-[130px] bg-background hover:bg-accent hover:text-accent-foreground",
            hasSelection && "border-solid border-primary/50 bg-primary/5 text-primary",
            className
          )}>
          
          <div className="flex items-center gap-1.5 overflow-hidden">
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {hasSelection ?
            <>
                <span className="truncate text-xs font-semibold">
                  {selectedLabels.join(', ')}
                </span>
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shrink-0">
                  {value.filter((v) => v !== 'all').length}
                </span>
              </> :

            <span className="truncate">{placeholder}</span>
            }
          </div>
          <ChevronDownIcon className="h-3 w-3 opacity-50 shrink-0 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <div className="flex flex-col">
          {/* Search input */}
          <div className="flex items-center border-b px-2 py-1.5 gap-1.5">
            <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${placeholder}...`}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground h-6" />
            
          </div>
          {/* Options list */}
          <div className="max-h-[240px] overflow-y-auto overflow-x-hidden p-1">
            {filtered.length === 0 &&
            <p className="py-4 text-center text-xs text-muted-foreground">No results found.</p>
            }
            {filtered.map((option) => {
              const isSelected = value.includes(option.value);
              const isDisabled = option.value !== 'all' && !isSelected && value.length >= max && !value.includes('all');
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {if (!isDisabled) handleSelect(option.value);}}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none w-full",
                    isDisabled ? "pointer-events-none opacity-50" : "hover:bg-accent hover:text-accent-foreground"
                  )}>
                  
                  <div className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                  )}>
                    <CheckIcon className="h-3 w-3" />
                  </div>
                  <span>{option.label}</span>
                </div>);

            })}
          </div>
          {/* Clear footer */}
          {value.length > 0 && !value.includes('all') &&
          <div className="p-1 border-t border-border bg-muted/30">
              <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(['all'])}
              className="w-full h-7 text-[10px] text-muted-foreground hover:text-foreground">
              
                Clear Selection
              </Button>
            </div>
          }
        </div>
      </PopoverContent>
    </Popover>);

};









export function CataloguePage({ onWebsiteClick, onPublisherClick, initialShowFavorites = false }) {
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [selectedSensitive, setSelectedSensitive] = useState(["all"]);
  const [selectedCountries, setSelectedCountries] = useState(["all"]);
  const [selectedLanguages, setSelectedLanguages] = useState(["all"]);
  const [selectedCopywriting, setSelectedCopywriting] = useState(["all"]);
  const [selectedLinkType, setSelectedLinkType] = useState(["all"]);
  const [selectedLinkCount, setSelectedLinkCount] = useState(["all"]);
  const [selectedAdvertisingMark, setSelectedAdvertisingMark] = useState(["all"]);
  const [selectedHomepageAnnouncements, setSelectedHomepageAnnouncements] = useState(["all"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(initialShowFavorites);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingItemId, setAddingItemId] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  // 🚨 FIX 1: Missing State Declarations adding here
  const [catalogueData, setCatalogueData] = useState([]);
  const [loading, setLoading] = useState(true);
 const { addItem, isInCart } = useCartStore();
useEffect(() => {
    const getWebsites = async () => {
      try {
        const response = await api.get('/api/website/');
        console.log("RAW API RESPONSE:", response.data);

        const websitesArray = response && response.data && Array.isArray(response.data.websites)
          ? response.data.websites
          : [];

        const activeWebsites = websitesArray.filter(web => web && web.status === 'active');

        // Dynamic flag dictionary mapping keys
        const countryFlags = {
          'United States': '🇺🇸',
          'United Kingdom': '🇬🇧',
          'Germany': '🇩🇪',
          'Spain': '🇪🇸',
          'France': '🇫🇷',
          'Canada': '🇨🇦',
          'Australia': '🇦🇺',
          'India': '🇮🇳',
          'Italy': '🇮🇹',
          'Netherlands': '🇳🇱',
          'Brazil': '🇧🇷'
        };

        const languageFlags = {
          'English': '🇺🇸',
          'Spanish': '🇪🇸',
          'German': '🇩🇪',
          'French': '🇫🇷',
          'Italian': '🇮🇹',
          'Portuguese': '🇵🇹',
          'Dutch': '🇳🇱'
        };

        const formatted = activeWebsites.map((web, index) => {
          const cleanDomain = web.websiteUrl
            ? web.websiteUrl.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
            : 'unknown.com';

          const siteCountry = web.countries && web.countries.length > 0 ? web.countries[0] : 'United States';
          const siteLanguage = web.language && web.language.length > 0 ? web.language[0] : 'English';

          return {
            ...web,
            id: web._id,
            domain: cleanDomain,
            initial: cleanDomain.charAt(0).toUpperCase(),
            initialColor: index % 2 === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600',
            rating: "4.5",
            published: "2h ago",
            categories: web.categories || [],
            sensitiveTopics: web.sensitiveTopics || [],
            country: siteCountry,
            language: siteLanguage,
            flag: countryFlags[siteCountry] || '🌐', // Dynamic Flag assignment
            langFlag: languageFlags[siteLanguage] || '🌐', // Dynamic Lang Flag assignment

            da: 35,
            dr: 40,
            traffic: "25K",

            price: web.priceNormal,
            copywriting: web.priceCopywriting || 0,
            discount: 0,
            isFavorite: false,
            badges: {
              proPublisher: true,
              fastDelivery: web.maxLinks <= 2,
              lifetimeGuarantee: true
            }
          };
        });

        setCatalogueData(formatted);
        console.log("✅ Catalogue data loaded:", formatted);
        setLoading(false);
      } catch (error) {
        console.error("Database fetch failed, loading fallback mock data", error);
        setLoading(false);
      }
    };

    getWebsites();
  }, []);

  // 🔍 FILTER LOGIC (Remains exactly the same as yours, working on `catalogueData` state)
  let filteredData = catalogueData;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredData = filteredData.filter((item) =>
      item.domain.toLowerCase().includes(query) ||
      item.categories.some((cat) => cat.toLowerCase().includes(query)) ||
      item.country.toLowerCase().includes(query) ||
      item.language.toLowerCase().includes(query)
    );
  }
  // Advanced Keywords Filter
  if (keywords.length > 0) {
    filteredData = filteredData.filter((item) =>
    keywords.every((keyword) => {
      const k = keyword.toLowerCase();
      return (
        item.domain.toLowerCase().includes(k) ||
        item.categories.some((cat) => cat.toLowerCase().includes(k)) ||
        item.country.toLowerCase().includes(k));

    })
    );
  }

  // Category Filter
  if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
    filteredData = filteredData.filter((item) =>
    selectedCategories.some((sel) =>
    item.categories.some((cat) => cat.toLowerCase() === sel.toLowerCase())
    )
    );
  }

  // Sensitive Topics Filter (blocked topics)
  if (selectedSensitive.length > 0 && !selectedSensitive.includes('all')) {
    filteredData = filteredData.filter((item) =>
    !selectedSensitive.some((sel) =>
    item.blocked.some((b) => b.toLowerCase() === sel.toLowerCase())
    )
    );
  }

  // Country Filter
  if (selectedCountries.length > 0 && !selectedCountries.includes('all')) {
    const countryMap = {
      us: 'united states', uk: 'united kingdom', de: 'germany',
      es: 'spain', fr: 'france', ca: 'canada', au: 'australia',
      in: 'india', it: 'italy', nl: 'netherlands', br: 'brazil'
    };
    filteredData = filteredData.filter((item) =>
    selectedCountries.some((sel) =>
    item.country.toLowerCase() === (countryMap[sel] ?? sel)
    )
    );
  }

  // Language Filter
  if (selectedLanguages.length > 0 && !selectedLanguages.includes('all')) {
    const langMap = {
      en: 'english', es: 'spanish', de: 'german',
      fr: 'french', it: 'italian', pt: 'portuguese', nl: 'dutch'
    };
    filteredData = filteredData.filter((item) =>
    selectedLanguages.some((sel) =>
    item.language.toLowerCase() === (langMap[sel] ?? sel)
    )
    );
  }

  // Link Type Filter (all items have same mock data - filter as a feature flag)
  // No. of Links Filter (same - visual filter)
  // Copywriting Filter
  if (selectedCopywriting.length > 0 && !selectedCopywriting.includes('all')) {
    if (selectedCopywriting.includes('yes') && !selectedCopywriting.includes('no')) {
      filteredData = filteredData.filter((item) => item.copywriting > 0);
    } else if (selectedCopywriting.includes('no') && !selectedCopywriting.includes('yes')) {
      filteredData = filteredData.filter((item) => item.copywriting === 0);
    }
  }

  if (showDiscountedOnly) {
    filteredData = filteredData.filter((item) => item.discount > 0);
  }
  if (showFavoritesOnly) {
    filteredData = filteredData.filter((item) => item.isFavorite);
  }

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const categories = [
  { value: "all", label: "All" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Health" },
  { value: "business", label: "Business" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "gaming", label: "Gaming" },
  { value: "travel", label: "Travel" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "fashion", label: "Fashion" },
  { value: "sports", label: "Sports" },
  { value: "automotive", label: "Automotive" }];


  const sensitiveTopics = [
  { value: "all", label: "All" },
  { value: "crypto", label: "Crypto" },
  { value: "gambling", label: "Gambling" },
  { value: "cbd", label: "CBD" },
  { value: "dating", label: "Dating" },
  { value: "forex", label: "Forex" },
  { value: "adult", label: "Adult" }];
const countryFlags = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'Spain': '🇪🇸',
  'France': '🇫🇷',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'India': '🇮🇳'
};
const languageFlags = {
  'English': '🇺🇸',
  'Spanish': '🇪🇸',
  'German': '🇩🇪',
  'French': '🇫🇷'
};

  const countries = [
  { value: "all", label: "All" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "es", label: "Spain" },
  { value: "fr", label: "France" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "in", label: "India" },
  { value: "it", label: "Italy" },
  { value: "nl", label: "Netherlands" },
  { value: "br", label: "Brazil" }];


  const languages = [
  { value: "all", label: "All" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" }];


  const copywritingOptions = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }];


  const yesNoOptions = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }];


  const linkTypeOptions = [
  { value: "all", label: "All" },
  { value: "dofollow", label: "Dofollow" },
  { value: "nofollow", label: "Nofollow" },
  { value: "sponsored", label: "Sponsored" }];


  const linkCountOptions = [
  { value: "all", label: "All" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" }];


  const handleResetFilters = () => {
    setSelectedCategories(["all"]);
    setSelectedSensitive(["all"]);
    setSelectedCountries(["all"]);
    setSelectedLanguages(["all"]);
    setSelectedCopywriting(["all"]);
    setSelectedLinkType(["all"]);
    setSelectedLinkCount(["all"]);
    setSelectedAdvertisingMark(["all"]);
    setSelectedHomepageAnnouncements(["all"]);
    setSearchQuery("");
    setKeywords([]);
    setKeywordInput("");
    // Reset advanced filters would go here in a real implementation
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedInput = keywordInput.trim();
      if (trimmedInput && keywords.length < 3 && !keywords.includes(trimmedInput)) {
        setKeywords([...keywords, trimmedInput]);
        setKeywordInput("");
      }
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(keywords.slice(0, -1));
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
  };

  const handleAddToCart = (itemId) => {
    addItem(item);
    setTimeout(() => {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));
      setAddingItemId(null);
    }, 400);
  };

  const incrementCartQuantity = (itemId, e) => {
    e.stopPropagation();
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <TooltipProvider>
      <RequestWebsiteModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)} />
      
      <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Catalogue</h2>
          <p className="text-xs text-muted-foreground">Find the best websites for your marketing strategy</p>
        </div>
        <Button
            onClick={() => setShowRequestModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-9 text-xs px-3 whitespace-nowrap">
            
          <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
          Request Website
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-border shadow-sm bg-card">
        <div className="p-4">
          {/* Search Bar & Toggle */}
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                  className="pl-9 h-9 bg-background border-input text-sm"
                  placeholder="Search by URL, Keyword, Description or Region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />
                
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn("h-9 text-xs whitespace-nowrap", showFavoritesOnly && "bg-rose-500 hover:bg-rose-600 text-white border-rose-600")}>
                  
                <HeartIcon className={cn("w-3.5 h-3.5 mr-1.5", showFavoritesOnly ? "fill-current" : "")} />
                Favorites
              </Button>

              <Button
                  variant={showFilters ? "secondary" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-9 text-xs whitespace-nowrap",
                    "border-primary/20 text-primary bg-primary/5 hover:bg-primary/10"
                  )}>
                  
                <FilterIcon className="w-3.5 h-3.5 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Collapsible Filter Area */}
          {showFilters &&
            <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in slide-in-from-top-2 duration-200 fade-in-0">
              {/* Filters Section */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <FilterSelect
                  placeholder="Category"
                  options={categories}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  icon={TagIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Country"
                  options={countries}
                  value={selectedCountries}
                  onChange={setSelectedCountries}
                  icon={GlobeIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Language"
                  options={languages}
                  value={selectedLanguages}
                  onChange={setSelectedLanguages}
                  icon={LanguagesIcon}
                  className="w-full" />
                

                <RangeFilter
                  label="Price"
                  icon={DollarSignIcon}
                  prefix="$"
                  min={0}
                  max={1000}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Copywriting"
                  options={copywritingOptions}
                  value={selectedCopywriting}
                  onChange={setSelectedCopywriting}
                  icon={PenToolIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Sensitive Topics"
                  options={sensitiveTopics}
                  value={selectedSensitive}
                  onChange={setSelectedSensitive}
                  icon={EyeOffIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Links Type"
                  options={linkTypeOptions}
                  value={selectedLinkType}
                  onChange={setSelectedLinkType}
                  icon={LinkIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="No. of Links"
                  options={linkCountOptions}
                  value={selectedLinkCount}
                  onChange={setSelectedLinkCount}
                  icon={HashIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Advertising Mark"
                  options={yesNoOptions}
                  value={selectedAdvertisingMark}
                  onChange={setSelectedAdvertisingMark}
                  icon={MegaphoneIcon}
                  className="w-full" />
                

                <FilterSelect
                  placeholder="Homepage Announcements"
                  options={yesNoOptions}
                  value={selectedHomepageAnnouncements}
                  onChange={setSelectedHomepageAnnouncements}
                  icon={LayoutTemplateIcon}
                  className="w-full" />
                

                <RangeFilter
                  label="Traffic"
                  icon={UsersIcon}
                  min={0}
                  suffix="K"
                  className="w-full" />
                

                <RangeFilter
                  label="DA"
                  icon={ActivityIcon}
                  min={0}
                  max={100}
                  className="w-full" />
                

                <RangeFilter
                  label="DR"
                  icon={BarChart3Icon}
                  min={0}
                  max={100}
                  className="w-full" />
                

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscountedOnly(!showDiscountedOnly)}
                  className={cn(
                    "h-8 border-dashed font-medium justify-between w-full bg-background hover:bg-accent hover:text-accent-foreground",
                    showDiscountedOnly && "border-solid border-green-500/50 bg-green-500/5 text-green-600 hover:bg-green-500/10"
                  )}>
                  
                  <div className="flex items-center gap-2 truncate">
                    <PercentIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Discounted Websites</span>
                  </div>
                  {showDiscountedOnly && <CheckIcon className="h-3 w-3 shrink-0 opacity-50" />}
                </Button>
              </div>

              {/* Advanced Filters Section */}
              {showAdvancedFilters &&
              <div className="pt-4 border-t border-dashed border-border space-y-6 animate-in slide-in-from-top-2 duration-200">
                  
                  {/* Top Row: Keyword, Date & Age */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">Keyword Search</label>
                        <span className="text-[10px] text-muted-foreground">{keywords.length}/3</span>
                      </div>
                      <div className="relative min-h-[36px] bg-background border border-input rounded-md flex flex-wrap items-center gap-1.5 px-2.5 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all">
                        <SearchIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {keywords.map((keyword, index) =>
                      <Badge key={index} variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 font-normal bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                            {keyword}
                            <XIcon
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeKeyword(keyword)} />
                        
                          </Badge>
                      )}
                        {keywords.length < 3 &&
                      <input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        placeholder={keywords.length === 0 ? "Type keyword..." : ""}
                        className="flex-1 bg-transparent border-none outline-none text-xs h-6 min-w-[60px] placeholder:text-muted-foreground" />

                      }
                      </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">Date Added</label>
                      </div>
                      <Input
                      type="date"
                      className="h-9 text-xs bg-background"
                      placeholder="Select start date" />
                    
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-muted-foreground">Website Age</label>
                      </div>
                      <RangeFilter
                      label="Years"
                      icon={CalendarIcon}
                      min={0}
                      suffix=" Yrs"
                      className="w-full h-9" />
                    
                    </div>
                  </div>

                  {/* Ahrefs Metrics Group */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border"></div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded">Ahrefs Metrics</h4>
                      <div className="h-px flex-1 bg-border"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      <RangeFilter
                      label="Organic Traffic"
                      icon={UsersIcon}
                      min={0}
                      suffix="K"
                      className="w-full" />
                    
                      <RangeFilter
                      label="Keywords"
                      icon={HashIcon}
                      min={0}
                      suffix="K"
                      className="w-full" />
                    
                      <RangeFilter
                      label="Ahrefs Rank"
                      icon={BarChart3Icon}
                      min={0}
                      max={100}
                      className="w-full" />
                    
                      <RangeFilter
                      label="Ref. Domains"
                      icon={GlobeIcon}
                      min={0}
                      className="w-full" />
                    
                      <RangeFilter
                      label="Backlinks"
                      icon={LinkIcon}
                      min={0}
                      className="w-full" />
                    
                    </div>
                  </div>

                  {/* Majestic Metrics Group */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border"></div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded">Majestic Metrics</h4>
                      <div className="h-px flex-1 bg-border"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <RangeFilter
                      label="Trust Flow (TF)"
                      icon={ActivityIcon}
                      min={0}
                      max={100}
                      className="w-full" />
                    
                      <RangeFilter
                      label="Citation Flow (CF)"
                      icon={ActivityIcon}
                      min={0}
                      max={100}
                      className="w-full" />
                    
                      <RangeFilter
                      label="Backlinks"
                      icon={LinkIcon}
                      min={0}
                      className="w-full" />
                    
                      <RangeFilter
                      label="Donor Domains"
                      icon={GlobeIcon}
                      min={0}
                      className="w-full" />
                    
                    </div>
                  </div>
                </div>
              }

              {/* Row 3: Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed border-border">
                <Button
                  variant={showAdvancedFilters ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-7 text-xs border-dashed px-2">
                  
                  <SlidersHorizontalIcon className="w-3 h-3 mr-1.5" />
                  {showAdvancedFilters ? "Hide Advanced Filters" : "Advanced Filters"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground px-2">
                  
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3">
                  
                  Apply
                </Button>
              </div>
            </div>
            }
        </div>
      </Card>

      {/* Results Table */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
          <tr>
  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[240px]">Website & Rating</th>
  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[220px]">Category & Topics</th>
  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[180px]">Region</th>
  
  {/* Authority Metrics Header Change */}
  <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[160px]">
    <div className="flex flex-col font-semibold text-muted-foreground ">
      <span className='font-semibold text-muted-foreground '>Authority</span>
      <span className='font-semibold text-muted-foreground '>Metrics</span>
    </div>
  </th>
  
  <th className="px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[120px]">Pricing</th>
  <th className="px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">Action</th>
</tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {currentData.map((item) =>{
                const isAdded = isInCart(item.id);
                return (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <div className={`size-7 rounded-md ${item.initialColor} flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5`}>
                        {item.initial}
                      </div>
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onWebsiteClick?.(item._id)}
                            className="text-sm font-semibold text-primary hover:underline truncate text-left">
                            
                            {item.domain}
                          </button>
                          {item.isFavorite && <HeartIcon className="w-2.5 h-2.5 text-rose-500 fill-rose-500 shrink-0" />}
                        </div>
                        
                        {/* Badges */}
                        {(item.badges.proPublisher || item.badges.fastDelivery || item.badges.lifetimeGuarantee) &&
                        <div className="flex items-center gap-1 flex-wrap">
                            {item.badges.proPublisher &&
                          <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-amber-200/50 hover:bg-slate-50 transition-colors cursor-help">
                                    <AwardIcon className="w-3 h-3 text-amber-600 stroke-[2]" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] bg-slate-900 text-white shadow-lg">
                                  <p className="text-xs font-semibold mb-1">Pro Publisher</p>
                                  <p className="text-xs leading-relaxed">Experienced and trusted publisher with strong performance history.</p>
                                </TooltipContent>
                              </Tooltip>
                          }
                            
                            {item.badges.fastDelivery &&
                          <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-yellow-200/50 hover:bg-slate-50 transition-colors cursor-help">
                                    <ZapIcon className="w-3 h-3 text-yellow-600 stroke-[2] fill-yellow-600" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] bg-slate-900 text-white shadow-lg">
                                  <p className="text-xs font-semibold mb-1">Fast Delivery</p>
                                  <p className="text-xs leading-relaxed">Orders are usually completed faster than the standard delivery time.</p>
                                </TooltipContent>
                              </Tooltip>
                          }
                            
                            {item.badges.lifetimeGuarantee &&
                          <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-emerald-200/50 hover:bg-slate-50 transition-colors cursor-help">
                                    <ShieldIcon className="w-3 h-3 text-emerald-600 stroke-[2]" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[240px] bg-slate-900 text-white shadow-lg">
                                  <p className="text-xs font-semibold mb-1">Lifetime Link Guarantee</p>
                                  <p className="text-xs leading-relaxed">We ensure your live link remains active. If any issue occurs, our team will resolve and restore the placement.</p>
                                </TooltipContent>
                              </Tooltip>
                          }
                          </div>
                        }
                        
                        <div className="flex items-center gap-1 text-[11px] mt-1">
                          <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-foreground font-medium">{item.rating}</span>
                          <span className="text-muted-foreground">Rating</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-1.5 text-xs text-foreground">
                        <BookmarkIcon className="w-3.5 h-3.5 text-[#007ad8] mt-0.5 shrink-0" />
                        <span className="leading-4">{item.categories.join(', ')}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <BanIcon className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <span className="leading-4">{item.sensitiveTopics && item.sensitiveTopics.length > 0 ? item.sensitiveTopics.join(', ') : 'None'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <span className="text-base leading-none">{item.langFlag}</span>
                        <span>{item.language}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <span className="text-base leading-none">{item.flag}</span>
                        <span className="text-muted-foreground">{item.country}</span>
                      </div>
                    </div>
                  </td>
                    <td className="px-3 py-4 align-top">
                    <div className="grid grid-cols-1 gap-1.5">
                      <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-100 max-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center size-3.5 rounded-sm bg-[#007ad8] text-white text-[8px] font-bold tracking-tighter">M</span>
                          <span className="text-[10px] font-medium text-muted-foreground">DA</span>
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{item.da}</span>
                      </div>
                      <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-100 max-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center size-3.5 rounded-sm bg-[#ff6300] text-white text-[8px] font-bold tracking-tighter">A</span>
                          <span className="text-[10px] font-medium text-muted-foreground">DR</span>
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{item.dr}</span>
                      </div>
                      <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-100 max-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center size-3.5 rounded-sm bg-[#323642] text-white text-[8px] font-bold tracking-tighter">S</span>
                          <span className="text-[10px] font-medium text-muted-foreground">Traffic</span>
                        </div>
                        <span className="text-[11px] font-medium text-foreground">{item.traffic}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Discount badge row */}
                      {item.discount > 0 &&
                      <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground line-through leading-none">${item.price}</span>
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold px-1.5 py-0.5 leading-none whitespace-nowrap">
                            <PercentIcon className="w-2.5 h-2.5" />
                            {item.discount}% OFF
                          </span>
                        </div>
                      }

                      {/* Main price */}
                      <span className={cn(
                        "font-bold leading-none tabular-nums",
                        item.discount > 0 ? "text-base text-green-600" : "text-base text-foreground"
                      )}>
                        ${item.discount > 0 ? (item.price * (1 - item.discount / 100)).toFixed(0) : item.price}
                      </span>

                      {/* Copywriting fee */}
                      {item.copywriting > 0 &&
                      <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-help mt-0.5">
                              <span className="text-sm text-muted-foreground leading-none">+${item.copywriting}</span>
                              <PenToolIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-slate-900 text-white max-w-[180px]">
                            <p className="text-xs font-semibold mb-0.5">Copywriting Fee</p>
                            <p className="text-xs leading-relaxed">+${item.copywriting} if you need the article written by our team.</p>
                          </TooltipContent>
                        </Tooltip>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex justify-end">
                      {cartItems[item.id] ?
                      <div className="inline-flex items-center rounded-md overflow-hidden shadow-sm">
                          <Button
                          onClick={(e) => incrementCartQuantity(item.id, e)}
                          variant="outline"
                          className="h-8 pl-2.5 pr-1.5 border-blue-500/60 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-r-none border-r-0">
                          
                            <CheckIcon className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            In Cart
                          </Button>
                          <button
                          onClick={(e) => incrementCartQuantity(item.id, e)}
                          className="flex h-8 min-w-[28px] items-center justify-center bg-blue-100 px-2 text-xs font-bold text-blue-700 border border-blue-500/60 border-l-0 hover:bg-blue-200 transition-colors cursor-pointer">
                          
                            {cartItems[item.id]}
                          </button>
                        </div> :

                      <Button
                        onClick={() => !isAdded && addItem(item)}
                        disabled={addingItemId === item.id}
                        className={cn(
                          "h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs font-medium justify-center transition-all duration-300 whitespace-nowrap",
                          addingItemId === item.id && "scale-95 bg-green-500 hover:bg-green-500"
                        )}>
                        
                          {addingItemId === item.id ?
                        <>
                              <CheckIcon className="w-3.5 h-3.5 mr-1.5 animate-in zoom-in duration-200" />
                              Adding...
                            </> :

                        <>
                              <ShoppingCartIcon className="w-3.5 h-3.5 mr-1.5" />
                              Add to Cart
                            </>
                        }
                        </Button>
                      }
                    </div>
                  </td>
                </tr>
               );
  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-border px-6 py-3 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium text-foreground">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border bg-white text-sm font-medium text-muted-foreground hover:bg-slate-50 disabled:opacity-50">
                    
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                
                {getPageNumbers().map((page, index) =>
                  page === '...' ?
                  <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-border bg-white text-sm font-medium text-muted-foreground">
                      ...
                    </span> :

                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                      currentPage === page ?
                      "z-10 bg-primary/10 border-primary text-primary hover:bg-primary/20" :
                      "bg-white border-border text-muted-foreground hover:bg-slate-50"
                    )}>
                    
                      {page}
                    </Button>

                  )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border bg-white text-sm font-medium text-muted-foreground hover:bg-slate-50 disabled:opacity-50">
                    
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>);

}