import { FileTextIcon, LoaderIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const statusConfig = [
{
  key: 'requests',
  icon: FileTextIcon,
  label: 'Order Requests',
  gradient: 'from-blue-500 to-blue-600',
  bgGradient: 'from-blue-50 to-blue-100',
  textColor: 'text-blue-600'
},
{
  key: 'inProgress',
  icon: LoaderIcon,
  label: 'In Progress',
  gradient: 'from-amber-500 to-orange-600',
  bgGradient: 'from-amber-50 to-orange-100',
  textColor: 'text-orange-600'
},
{
  key: 'completed',
  icon: CheckCircle2Icon,
  label: 'Completed',
  gradient: 'from-green-500 to-emerald-600',
  bgGradient: 'from-green-50 to-emerald-100',
  textColor: 'text-green-600'
},
{
  key: 'cancelled',
  icon: XCircleIcon,
  label: 'Cancelled',
  gradient: 'from-red-500 to-rose-600',
  bgGradient: 'from-red-50 to-rose-100',
  textColor: 'text-red-600'
}];


export function OrderStatusCards() {
const { orderStats, fetchOrderStats, isLoading } = useDashboardStore();
  const cardsRef = useRef([]);
  const countersRef = useRef([]);
useEffect(() => {
    fetchOrderStats();
  }, [fetchOrderStats]);
  console.log(orderStats)
  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.1, ease: 'back.out(1.7)' }
        );
      }
    });

    countersRef.current.forEach((counter, index) => {
      if (counter) {
        const key = statusConfig[index].key;
        const targetValue = orderStats[key];
        gsap.fromTo(
          counter,
          { innerText: 0 },
          {
            innerText: targetValue,
            duration: 1.5,
            delay: index * 0.1 + 0.3,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () {
              if (counter) {
                counter.innerText = Math.ceil(parseFloat(counter.innerText)).toString();
              }
            }
          }
        );
      }
    });
  }, [orderStats]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {statusConfig.map((config, index) => {
        const Icon = config.icon;
        const key = config.key;
        const value = orderStats[key];

        return (
          <div key={config.key} ref={(el) => cardsRef.current[index] = el}>
            <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.bgGradient} opacity-20 rounded-full -mr-16 -mt-16`} />
              <CardContent className="p-3 sm:p-4 md:p-5 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1 sm:mb-2 truncate">{config.label}</p>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span
                        ref={(el) => countersRef.current[index] = el}
                        className={`text-xl sm:text-2xl font-medium font-mono ${config.textColor}`}>
                        
                        {value}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">orders</span>
                    </div>
                  </div>
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>);

      })}
    </div>);

}