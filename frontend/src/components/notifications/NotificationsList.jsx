import { useEffect, useRef,useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  BellIcon,
  CheckCheckIcon,
  ShoppingCartIcon,
  FileEditIcon,
  XCircleIcon,
  LockIcon,
  MailIcon,
  ClockIcon,
  CheckCircleIcon,
  LinkIcon,
  FileCheckIcon,
  MessageSquareIcon,
  SparklesIcon } from
'lucide-react';
import { gsap } from 'gsap';

export function NotificationsList() {
  const { notifications, markAllAsRead, markAsRead, deleteNotification } = useNotificationStore();
  console.log(notifications)
  
  const listRef = useRef(null);
const [filter, setFilter] = useState('all'); // State define karein
  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(
        listRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, []);

const filteredNotifications = filter === 'unread' 
  ? notifications.filter((n) => !n.isRead) 
  : notifications;

  const getStatusConfig = (type) => {
    switch (type) {
      case 'ORDER_RECEIVED':
        return {
          icon: ShoppingCartIcon,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100'
        };
      case 'ORDER_ACCEPTED':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-100'
        };
      case 'LINK_SUBMITTED':
        return {
          icon: LinkIcon,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100'
        };
      case 'REVISION_SUBMITTED':
        return {
          icon: FileCheckIcon,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-100'
        };
      case 'ORDER_COMPLETED':
        return {
          icon: CheckCircleIcon,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100'
        };
      case 'MESSAGE_RECEIVED':
        return {
          icon: MessageSquareIcon,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-100'
        };
      case 'NEW_OPPORTUNITY':
        return {
          icon: SparklesIcon,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100'
        };
      case 'REVISION_REQUESTED':
        return {
          icon: FileEditIcon,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100'
        };
      case 'ORDER_CANCELLED':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-100'
        };
      case 'PASSWORD_UPDATED':
        return {
          icon: LockIcon,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-100'
        };
      case 'EMAIL_UPDATED':
        return {
          icon: MailIcon,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-100'
        };
      default:
        return {
          icon: BellIcon,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-100'
        };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-card">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
          className="h-7 text-xs text-muted-foreground hover:text-foreground">
          
          <CheckCheckIcon className="w-3 h-3 mr-1" />
          Mark all read
        </Button>
      </div>

      {/* Notification List */}
      <ScrollArea className="flex-1">
        <div ref={listRef} className="p-2 space-y-2">
          {filteredNotifications.length > 0 ?
          filteredNotifications.map((notification) => {
            const config = getStatusConfig(notification.status);
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`group relative p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                notification.isRead ?
                'bg-card border-transparent hover:border-border' :
                'bg-primary/5 border-primary/10'}`
                }
                onClick={() => !notification.isRead && markAsRead(notification.id)}>
                
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color} border ${config.border}`}>
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed mb-1.5 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 font-mono tracking-wider ${config.bg} ${config.color} border-transparent`}>
                          {notification.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  
                  {/* Unread Indicator */}
                  {!notification.isRead &&
                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse group-hover:opacity-0" />
                }
                </div>);

          }) :

          <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BellIcon className="w-6 h-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter === 'unread' ? "You're all caught up!" : "No notifications to display"}
              </p>
            </div>
          }
        </div>
      </ScrollArea>
    </div>);

}