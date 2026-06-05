import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';




export function OrdersByDateChart() {
const { weeklyChartData, monthlyChartData, fetchOrderStats, chartPeriod, setChartPeriod } = useDashboardStore();

  useEffect(() => { 
    fetchOrderStats(); 
  }, [fetchOrderStats]);
// Dynamic data select karein
  const data = chartPeriod === 'weekly' ? (weeklyChartData || []) : (monthlyChartData || []);
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-foreground text-lg font-medium">Orders by Date</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Average number of orders over time</p>
          </div>
          <Tabs value={chartPeriod} onValueChange={(value) => setChartPeriod(value)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="weekly" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
                Monthly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[260px] md:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="date"
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
                tickLine={false} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }} />
              
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorOrders)"
                animationDuration={1500}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }} />
              
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);

}