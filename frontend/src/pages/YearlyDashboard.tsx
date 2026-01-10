import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingUp, Target } from 'lucide-react';
import { getIconComponent } from '@/components/IconSelector';

interface QuotaStat {
    quota_id: number;
    name: string;
    total: number;
    unit: string;
    category?: string;
    icon?: string;
    label?: string;
    monthly_breakdown: Record<string, number>;
}

interface RitualStat {
    ritual_id: number;
    name: string;
    total: number;
    target: number;
    unit: string;
    percent: number;
    icon?: string;
    monthly_breakdown: Record<string, number>;
}

interface YearlyStats {
    year_progress: number;
    monthly_activity: Record<string, number>;
    rituals: RitualStat[];
    quotas: QuotaStat[];
}

export const YearlyDashboard: React.FC = () => {
    const [stats, setStats] = useState<YearlyStats | null>(null);

    useEffect(() => {
        api.get('/stats/yearly').then(r => setStats(r.data));
    }, []);

    const handleExport = () => {
        window.location.href = '/api/logs/export';
    };

    if (!stats) return <div className="text-muted-foreground">Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Yearly Analytics</h2>
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Year Progress</CardTitle>
                    <CardDescription>{stats.year_progress.toFixed(1)}% of the year complete</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={stats.year_progress} className="h-4" />
                </CardContent>
            </Card>

            {/* Ritual Progress Section */}
            {stats.rituals && stats.rituals.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        Ritual Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.rituals.map(ritual => {
                            const monthlyTarget = ritual.target / 12;

                            // Find max value for scaling (either max data point or the target)
                            const maxDataVal = Math.max(...Object.values(ritual.monthly_breakdown), 0);
                            const maxScale = Math.max(maxDataVal, monthlyTarget, 1);

                            return (
                                <Card key={ritual.ritual_id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{ritual.name}</CardTitle>
                                        <CardDescription>
                                            Yearly target: {ritual.target.toFixed(0)} {ritual.unit}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Yearly Progress</span>
                                                <span className="font-medium">
                                                    {ritual.total.toFixed(0)} / {ritual.target.toFixed(0)} {ritual.unit}
                                                </span>
                                            </div>
                                            <Progress value={ritual.percent} className="h-2" />
                                        </div>

                                        {/* Monthly mini chart */}
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-2">Monthly Activity</div>
                                            <div className="h-24 flex items-end gap-1 relative pt-4">
                                                {/* Target Line */}
                                                {monthlyTarget > 0 && (
                                                    <div
                                                        className="absolute w-full border-t border-dashed border-muted-foreground/50 z-10 flex items-center"
                                                        style={{ bottom: `${(monthlyTarget / maxScale) * 100}%` }}
                                                    >
                                                        <span className="text-[10px] text-muted-foreground bg-card px-1 absolute right-0 -translate-y-1/2">
                                                            Target: {monthlyTarget.toFixed(0)}
                                                        </span>
                                                    </div>
                                                )}

                                                {Array.from({ length: 12 }, (_, i) => {
                                                    // Create date object for the 1st of each month in current year
                                                    const date = new Date(new Date().getFullYear(), i, 1);
                                                    // Manually construct YYYY-MM key to avoid timezone shifts
                                                    const year = date.getFullYear();
                                                    const month = String(i + 1).padStart(2, '0');
                                                    const monthKey = `${year}-${month}`;

                                                    const monthVal = ritual.monthly_breakdown[monthKey] || 0;
                                                    const height = (monthVal / maxScale) * 100;
                                                    const monthName = date.toLocaleDateString('en', { month: 'short' });

                                                    // Check if target is met (and target > 0)
                                                    const isTargetMet = monthlyTarget > 0 && monthVal >= monthlyTarget;
                                                    const barColor = isTargetMet ? 'bg-[#618B28]' : 'bg-primary/80';

                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col justify-end group relative z-20 h-full">
                                                            <div
                                                                className={`${barColor} hover:opacity-90 transition-all rounded-t w-full`}
                                                                style={{ height: `${Math.max(height, 0)}%` }}
                                                            >
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-popover px-2 py-1 rounded border z-30">
                                                                    {monthName}: {monthVal.toFixed(0)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>Jan</span>
                                                <span>Dec</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quota Statistics */}
            {stats.quotas && stats.quotas.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        Quota Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.quotas.map(quota => {
                            const IconComponent = getIconComponent(quota.icon);

                            return (
                                <Card key={quota.quota_id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <IconComponent className="h-6 w-6" />
                                            <div>
                                                <CardTitle>{quota.name}</CardTitle>
                                                <CardDescription>
                                                    {quota.label || `${quota.unit} this year`}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-4xl font-bold mb-4">{quota.total.toFixed(0)}</div>

                                        {/* Monthly mini chart */}
                                        <div className="h-16 flex items-end gap-1">
                                            {Object.entries(quota.monthly_breakdown).sort().map(([month, count]) => {
                                                const maxCount = Math.max(...Object.values(quota.monthly_breakdown));
                                                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                                return (
                                                    <div key={month} className="flex-1 flex flex-col justify-end group relative">
                                                        <div
                                                            className="bg-primary/50 hover:bg-primary transition-all rounded-t"
                                                            style={{ height: `${height}%` }}
                                                        >
                                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-popover px-2 py-1 rounded border">
                                                                {count.toFixed(0)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
