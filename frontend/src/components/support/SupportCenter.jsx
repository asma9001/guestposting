import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSupportStore } from '@/stores/supportStore';
import {
  LifeBuoyIcon,
  SendIcon,
  PaperclipIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  FileIcon
} from
  'lucide-react';
import { gsap } from 'gsap';
import { TicketDetails } from './TicketDetails';

export function SupportCenter() {
  const {
    tickets,
    createTicket,
    selectedTicket,
    setSelectedTicket,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    getTickets
  } = useSupportStore();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [relatedUrl, setRelatedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;
  
  const headerRef = useRef(null);
  const formRef = useRef(null);
  const ticketsRef = useRef(null);

  useEffect(() => {
    getTickets();
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
    }
    if (ticketsRef.current) {
      gsap.fromTo(
        ticketsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!priority) newErrors.priority = 'Please select a priority';
    if (!message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const MAX_SIZE = 10 * 1024 * 1024; 
    const valid = files.filter((f) => f.size <= MAX_SIZE);
    setAttachedFiles((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, 5); 
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeFile = (idx) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    // 1. JSON ke bajaye FormData ka instance banayein
    const formData = new FormData();
    
    // 2. Apne normal text fields append karein
    formData.append('subject', subject);
    formData.append('category', category);
    formData.append('priority', priority);
    if (relatedUrl) formData.append('relatedUrl', relatedUrl);
    formData.append('message', message);

    // 3. Apni attached files ko loop chala kar append karein
    attachedFiles.forEach((file) => {
      formData.append('attachments', file); // 'attachments' aapka backend field name hoga
    });

    // 4. Poora formData object apne store function ko pass karein
    const newTicket = await createTicket(formData);

    // State reset logic (Aapka purana code)
    setSelectedTicket(newTicket);
    setSubject('');
    setCategory('');
    setPriority('');
    setRelatedUrl('');
    setMessage('');
    setAttachedFiles([]);
    setErrors({});
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);

  } catch (err) {
    console.error("Ticket submission failed:", err);
  }
};

  const getStatusBadge = (status) => {
    const config = {
      open: { label: 'Open', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 border-green-200' },
      closed: { label: 'Closed', className: 'bg-gray-50 text-gray-700 border-gray-200' }
    };

    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

const getPriorityBadge = (priority) => {
    // Pehle handle karein agar priority missing ya kisi aur case mein ho
    const normalizedPriority = priority ? priority.toLowerCase() : 'low';

    const config = {
      low: { label: 'Low', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      high: { label: 'High', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700 border-red-200' }
    };

    // Fallback: Agar exact match na mile, to 'low' ya koi default styling use karein
    const badge = config[normalizedPriority] || config.low;
    
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

const filteredTickets = tickets.filter((ticket) => {
    // 1. Raw ID ya Subject check karein
    const matchesRawIdOrSubject =
      ticket._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Choti Visual ID (jaise 'TCK-A1B2' ya sirf 'A1B2') generate karke check karein
    const visualId = `TCK-${ticket._id.substring(ticket._id.length - 4).toUpperCase()}`;
    const matchesVisualId = visualId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = matchesRawIdOrSubject || matchesVisualId;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  if (selectedTicket) {
    return <TicketDetails ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div ref={headerRef}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LifeBuoyIcon className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
            <p className="text-sm text-muted-foreground">Submit a support ticket and track its progress</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess &&
        <Card className="border-green-200 bg-green-50 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-900 font-medium">
                Ticket submitted successfully. We'll respond within 24-48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      }

      {/* Create New Ticket */}
      <Card ref={formRef} className="border-border shadow-sm">
        <CardHeader className="border-b border-border py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquareIcon className="w-4 h-4 text-primary" />
              Create New Support Ticket
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              24-48h response
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-sm">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Briefly describe your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`h-9 ${errors.subject ? 'border-red-500' : ''}`} />

              {errors.subject &&
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" />
                  {errors.subject}
                </p>
              }
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className={`h-9 ${errors.category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account Issue</SelectItem>
                    <SelectItem value="payment">Payment / Withdrawal</SelectItem>
                    <SelectItem value="approval">Guest Post Approval</SelectItem>
                    <SelectItem value="technical">Website / Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category &&
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircleIcon className="w-3 h-3" />
                    {errors.category}
                  </p>
                }
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-sm">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className={`h-9 ${errors.priority ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority &&
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircleIcon className="w-3 h-3" />
                    {errors.priority}
                  </p>
                }
              </div>
            </div>

            {/* Related URL */}
            <div className="space-y-1.5">
              <Label htmlFor="relatedUrl" className="text-sm">Related URL or Order ID</Label>
              <Input
                id="relatedUrl"
                placeholder="Paste URL or order ID (optional)"
                value={relatedUrl}
                onChange={(e) => setRelatedUrl(e.target.value)}
                className="h-9" />

            </div>

            {/* Message with attachment button inside */}
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-sm">
                Message <span className="text-red-500">*</span>
              </Label>
              <div className={`rounded-md border bg-background ${errors.message ? 'border-red-500' : 'border-input'} focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2`}>
                <Textarea
                  id="message"
                  placeholder="Explain your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none rounded-b-none" />

                <div className="flex flex-col gap-2 px-3 py-2 border-t border-border bg-muted/30 rounded-b-md">
                  <label htmlFor="file-upload" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors group w-fit">
                    <PaperclipIcon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">Attach files</span>
                    <span className="text-muted-foreground/60">(Max 10MB · up to 5 files)</span>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      accept="*/*"
                      onChange={handleFileChange} />

                  </label>
                  {attachedFiles.length > 0 &&
                    <div className="flex flex-wrap gap-1.5">
                      {attachedFiles.map((file, idx) =>
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 text-[11px] max-w-[200px]">

                          <FileIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-primary/60 shrink-0">({(file.size / 1024).toFixed(0)}KB)</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="ml-0.5 hover:text-red-500 transition-colors shrink-0">

                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  }
                </div>
              </div>
              {errors.message &&
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircleIcon className="w-3 h-3" />
                  {errors.message}
                </p>
              }
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Response within 24–48 hours
              </p>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90">

                <SendIcon className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* My Tickets */}
      <Card ref={ticketsRef} className="border-border shadow-sm">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-base">My Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket ID or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9" />

              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets Table */}
          {paginatedTickets.length > 0 ?
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Ticket ID</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Subject</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Priority</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Updated</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) =>
                      <tr key={ticket._id}
                        className="border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTicket(ticket)}>

                        <td className="py-3 px-3 text-sm font-mono font-semibold text-foreground">
TCK-{ticket._id.substring(ticket._id.length - 4).toUpperCase()}

</td>
                        <td className="py-3 px-3">
                          <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                        </td>
                        <td className="py-3 px-3 text-sm text-muted-foreground capitalize">
                          {ticket.category.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-3">
                          {getPriorityBadge(ticket.priority)}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="py-3 px-3 text-sm text-muted-foreground">
                          {new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-primary/10 h-7 px-2 text-xs">

                            View
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 &&
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} tickets
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8">

                      <ChevronLeftIcon className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-foreground px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8">

                      <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              }
            </> :

            <div className="text-center py-12">
              <LifeBuoyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                {searchQuery || statusFilter !== 'all' ?
                  'No tickets found' :
                  'No support tickets yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' ?
                  'Try adjusting your search or filters' :
                  'Use the form above to submit your first ticket'}
              </p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

}