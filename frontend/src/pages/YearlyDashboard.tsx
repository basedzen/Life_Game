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

interface YearlyStats {
    year_progress: number;
    monthly_activity: Record<string, number>;
    quotas: QuotaStat[];
}

export const YearlyDashboard: React.FC = () => {
    const [stats, setStats] = useState<YearlyStats | null>(null);
    const [rituals, setRituals] = useState<any[]>([]);

    useEffect(() => {
        api.get('/stats/yearly').then(r => setStats(r.data));
        api.get('/config/rituals').then(r => setRituals(r.data));
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
            {rituals && rituals.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <Target className="h-6 w-6" />
                        Ritual Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rituals.map(ritual => {
                            // Calculate yearly target (weekly target * 52 weeks)
                            const yearlyTarget = ritual.target_value * 52;

                            return (
                                <Card key={ritual.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{ritual.name}</CardTitle>
                                        <CardDescription>
                                            Weekly target: {ritual.target_value} {ritual.unit}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Yearly Progress</span>
                                                <span className="font-medium">
                                                    0 / {yearlyTarget.toFixed(0)} {ritual.unit}
                                                </span>
                                            </div>
                                            <Progress value={0} className="h-2" />
                                        </div>

                                        {/* Monthly mini chart */}
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-2">Monthly Activity</div>
                                            <div className="h-20 flex items-end gap-1">
                                                {Array.from({ length: 12 }, (_, i) => {
                                                    const monthProgress = 0; // Would come from actual data
                                                    const height = monthProgress > 0 ? Math.min(100, monthProgress) : 5;
                                                    const month = new Date(2025, i).toLocaleDateString('en', { month: 'short' });

                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                                            <div
                                                                className="bg-primary/30 hover:bg-primary transition-all rounded-t"
                                                                style={{ height: `${height}%` }}
                                                            >
                                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-popover px-2 py-1 rounded border">
                                                                    {month}: {monthProgress}%
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

            {/* Monthly Activity Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Activity</CardTitle>
                    <CardDescription>Total logs per month</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end gap-2 pt-8">
                        {Object.entries(stats.monthly_activity).sort().map(([month, count]) => (
                            <div key={month} className="flex-1 flex flex-col justify-end group">
                                <div
                                    className="bg-primary/50 border-t border-x border-primary hover:bg-primary transition-all relative rounded-t"
                                    style={{ height: `${Math.min(100, count * 2)}%` }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded border">
                                        {count}
                                    </div>
                                </div>
                                <div className="text-xs text-center text-muted-foreground mt-2 rotate-45 origin-left translate-x-2">
                                    {month}
                                </div>
                            </div>
                        ))}
                        {Object.keys(stats.monthly_activity).length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No activity recorded yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
