import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagInput } from '@/components/ui/TagInput';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { getIconComponent } from '@/components/IconSelector';
interface Ritual {
    id: number;
    name: string;
    unit: string;
}

interface Quota {
    id: number;
    name: string;
    unit: string;
    icon?: string;
}

export const Logger: React.FC = () => {
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [quotas, setQuotas] = useState<Quota[]>([]);
    const [selectedRitual, setSelectedRitual] = useState<string>('');
    const [selectedQuota, setSelectedQuota] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [tag, setTag] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/config/rituals').then(r => setRituals(r.data));
        api.get('/quotas/').then(q => setQuotas(q.data));
    }, []);

    const handleLogRitual = async (ritualId: number, val: number, t: string, dateStr?: string) => {
        setLoading(true);
        try {
            let logDate: Date;

            if (dateStr) {
                logDate = new Date(dateStr);
            } else {
                logDate = new Date();
            }

            logDate.setHours(12, 0, 0, 0);

            const year = logDate.getFullYear();
            const month = String(logDate.getMonth() + 1).padStart(2, '0');
            const day = String(logDate.getDate()).padStart(2, '0');
            const timestamp = `${year} -${month} -${day} T12:00:00`;

            await api.post('/logs/', {
                ritual_id: ritualId,
                value: val,
                tag: t,
                timestamp: timestamp,
                metric_type: 'ritual'
            });
            setValue('');
            setTag('');
            setSelectedDate('');
            alert('Ritual logged successfully');
        } catch (e) {
            console.error(e);
            alert('Failed to log');
        } finally {
            setLoading(false);
        }
    };

    const handleLogQuota = async (quotaId: number, val: number, t: string, dateStr?: string) => {
        setLoading(true);
        try {
            let logDate: Date;

            if (dateStr) {
                logDate = new Date(dateStr);
            } else {
                logDate = new Date();
            }

            logDate.setHours(12, 0, 0, 0);

            const year = logDate.getFullYear();
            const month = String(logDate.getMonth() + 1).padStart(2, '0');
            const day = String(logDate.getDate()).padStart(2, '0');
            const timestamp = `${year} -${month} -${day} T12:00:00`;

            await api.post('/logs/', {
                quota_id: quotaId,
                value: val,
                tag: t,
                timestamp: timestamp,
                metric_type: 'quota'
            });
            setValue('');
            setTag('');
            setSelectedDate('');
            alert('Quota logged successfully');
        } catch (e) {
            console.error(e);
            alert('Failed to log');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLog = (quota: Quota) => {
        handleLogQuota(quota.id, 1, 'Quick Toggle');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Log Ritual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ritual-select">Ritual</Label>
                            <Select value={selectedRitual} onValueChange={setSelectedRitual}>
                                <SelectTrigger id="ritual-select">
                                    <SelectValue placeholder="Select Ritual" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rituals.map(r => (
                                        <SelectItem key={r.id} value={r.id.toString()}>
                                            {r.name} ({r.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ritual-value">Value</Label>
                            <Input
                                id="ritual-value"
                                type="number"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                placeholder="0.0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ritual-date">Date (Optional)</Label>
                            <Input
                                id="ritual-date"
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ritual-tag">Tag (Optional)</Label>
                            <TagInput
                                id="ritual-tag"
                                value={tag}
                                onChange={setTag}
                                placeholder="e.g. #Morning"
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => selectedRitual && handleLogRitual(parseInt(selectedRitual), parseFloat(value), tag, selectedDate)}
                            disabled={!selectedRitual || !value || loading}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Log Ritual
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Log Quota</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="quota-select">Quota</Label>
                            <Select value={selectedQuota} onValueChange={setSelectedQuota}>
                                <SelectTrigger id="quota-select">
                                    <SelectValue placeholder="Select Quota" />
                                </SelectTrigger>
                                <SelectContent>
                                    {quotas.map(q => (
                                        <SelectItem key={q.id} value={q.id.toString()}>
                                            {q.name} ({q.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quota-value">Value</Label>
                            <Input
                                id="quota-value"
                                type="number"
                                step="1"
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quota-date">Date (Optional)</Label>
                            <Input
                                id="quota-date"
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quota-tag">Tag (Optional)</Label>
                            <TagInput
                                id="quota-tag"
                                value={tag}
                                onChange={setTag}
                                placeholder="e.g. #Morning"
                            />
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => selectedQuota && handleLogQuota(parseInt(selectedQuota), parseInt(value), tag, selectedDate)}
                            disabled={!selectedQuota || !value || loading}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Log Quota
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Toggles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {quotas.map(quota => {
                            const IconComponent = getIconComponent(quota.icon);
                            return (
                                <Button
                                    key={quota.id}
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2"
                                    onClick={() => handleQuickLog(quota)}
                                >
                                    <IconComponent className="h-8 w-8" />
                                    <span className="text-xs">{quota.name}</span>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
