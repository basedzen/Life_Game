import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';
import { getIconComponent } from '@/components/IconSelector';
import { cn } from '@/lib/utils';

interface WeeklyStats {
    rituals: {
        ritual_id: number;
        name: string;
        current: number;
        target: number;
        unit: string;
        percent: number;
        icon?: string;
    }[];
    quotas: {
        quota_id: number;
        name: string;
        total: number;
        unit: string;
        icon?: string;
        label?: string;
    }[];
    unlock_percent: number;
}

interface Reward {
    roll_number: number;
    reward_description: string;
}

export const WeeklyTracker: React.FC = () => {
    const [stats, setStats] = useState<WeeklyStats | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [rollResult, setRollResult] = useState<number | null>(null);
    const [rolling, setRolling] = useState(false);
    const [showReward, setShowReward] = useState<Reward | null>(null);
    const [diceThreshold, setDiceThreshold] = useState<number>(75);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        api.get('/config/rewards').then(r => setRewards(r.data)).catch(console.error);
        api.get('/config/settings/dice_threshold').then(r => {
            if (r.data) setDiceThreshold(parseInt(r.data.value));
        }).catch(console.error);
    }, []);

    const fetchStats = () => {
        api.get('/stats/weekly')
            .then(r => setStats(r.data))
            .catch(e => {
                console.error(e);
                setError('Failed to load stats. Please check backend connection.');
            });
    };

    const handleRoll = () => {
        setRolling(true);
        setShowReward(null);
        let count = 0;
        const interval = setInterval(() => {
            setRollResult(Math.floor(Math.random() * 20) + 1);
            count++;
            if (count > 20) {
                clearInterval(interval);
                const finalRoll = Math.floor(Math.random() * 20) + 1;
                setRollResult(finalRoll);
                setRolling(false);
                const reward = rewards.find(r => r.roll_number === finalRoll);
                setShowReward(reward || { roll_number: finalRoll, reward_description: 'No Reward Configured' });
            }
        }, 100);
    };

    if (error) return <div className="text-destructive p-4">{error}</div>;
    if (!stats) return <div className="text-muted-foreground p-4">Loading...</div>;

    const isUnlocked = stats.unlock_percent >= diceThreshold;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Weekly Progress</h2>
                    {stats.rituals.map(r => (
                        <Card key={r.ritual_id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const Icon = getIconComponent(r.icon);
                                            return <Icon className="h-5 w-5 text-muted-foreground" />;
                                        })()}
                                        <CardTitle className="text-xl">{r.name}</CardTitle>
                                    </div>
                                    <span className="text-sm font-mono text-muted-foreground">
                                        {r.current} / {r.target} {r.unit}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Progress value={r.percent} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-2">{r.percent.toFixed(1)}% complete</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className={cn("transition-all duration-500", !isUnlocked && "opacity-50")}>
                    <CardHeader>
                        <CardTitle>Dice Panel</CardTitle>
                        <CardDescription>
                            {isUnlocked ? 'Roll for your reward' : `Reach ${diceThreshold}% to unlock`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isUnlocked ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
                                <Lock size={48} />
                                <div className="text-center">
                                    <div className="text-xl font-bold">LOCKED</div>
                                    <div className="text-sm">Reach {diceThreshold}% completion to unlock</div>
                                    <div className="text-xs mt-2">Current: {stats.unlock_percent.toFixed(1)}%</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 gap-6">
                                <div className="relative">
                                    <div className={cn(
                                        "w-32 h-32 border-4 border-primary flex items-center justify-center text-6xl font-bold rounded-lg bg-card",
                                        rolling && "animate-pulse"
                                    )}>
                                        {rollResult ?? '?'}
                                    </div>
                                </div>

                                {showReward ? (
                                    <div className="text-center space-y-2">
                                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Reward Acquired</div>
                                        <div className="text-xl font-bold">{showReward.reward_description}</div>
                                    </div>
                                ) : (
                                    <Button onClick={handleRoll} disabled={rolling} className="w-full">
                                        {rolling ? 'Rolling...' : 'Roll D20'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {stats.quotas && stats.quotas.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Weekly Quotas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.quotas.map(quota => {
                            const IconComponent = getIconComponent(quota.icon);

                            return (
                                <Card key={quota.quota_id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <IconComponent className="h-6 w-6" />
                                            <div>
                                                <CardTitle className="text-lg">{quota.name}</CardTitle>
                                                {quota.label && (
                                                    <CardDescription>{quota.label}</CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{quota.total}</div>
                                        <p className="text-sm text-muted-foreground">{quota.unit} this week</p>
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
