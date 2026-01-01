import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Save, RefreshCw } from 'lucide-react';

interface Ritual {
    id: number;
    name: string;
    target_value: number;
    unit: string;
}

interface Log {
    id: number;
    ritual_id: number;
    timestamp: string;
    value: number;
}

interface WeekData {
    [ritualId: number]: {
        [day: string]: { value: string; logId?: number };
    };
}

export const BulkWeeklyInput: React.FC = () => {
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [weekData, setWeekData] = useState<WeekData>({});
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRituals();
    }, []);

    useEffect(() => {
        if (rituals.length > 0) {
            fetchWeekLogs();
        }
    }, [currentWeekStart, rituals]);

    const fetchRituals = async () => {
        const res = await api.get('/config/rituals');
        setRituals(res.data);
    };

    const fetchWeekLogs = async () => {
        try {
            const res = await api.get('/logs/');
            const logs: Log[] = res.data;

            const newWeekData: WeekData = {};
            rituals.forEach((ritual) => {
                newWeekData[ritual.id] = {};
            });

            const weekDays = getDaysOfWeek();
            const weekStart = weekDays[0];
            const weekEnd = weekDays[6];

            logs.forEach((log) => {
                const logDate = new Date(log.timestamp);
                if (logDate >= weekStart && logDate <= weekEnd && log.ritual_id) {
                    const dateStr = formatDate(logDate);

                    if (!newWeekData[log.ritual_id]) {
                        newWeekData[log.ritual_id] = {};
                    }

                    if (newWeekData[log.ritual_id][dateStr]) {
                        const currentValue = parseFloat(newWeekData[log.ritual_id][dateStr].value) || 0;
                        newWeekData[log.ritual_id][dateStr] = {
                            value: (currentValue + log.value).toString(),
                            logId: newWeekData[log.ritual_id][dateStr].logId
                        };
                    } else {
                        newWeekData[log.ritual_id][dateStr] = {
                            value: log.value.toString(),
                            logId: log.id
                        };
                    }
                }
            });

            setWeekData(newWeekData);
        } catch (e) {
            console.error('Failed to fetch logs:', e);
        }
    };

    function getMonday(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    const getDaysOfWeek = (): Date[] => {
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const formatDateDisplay = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDayHeader = (date: Date): string => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[date.getDay()]} ${date.getDate()}`;
    };

    const handleCellChange = (ritualId: number, day: string, value: string) => {
        setWeekData(prev => ({
            ...prev,
            [ritualId]: {
                ...prev[ritualId],
                [day]: {
                    value: value,
                    logId: prev[ritualId]?.[day]?.logId
                }
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let updateCount = 0;
            let createCount = 0;

            for (const ritualId in weekData) {
                for (const day in weekData[ritualId]) {
                    const cellData = weekData[ritualId][day];
                    const value = parseFloat(cellData.value);

                    if (!isNaN(value) && value >= 0) {
                        const date = new Date(day);
                        date.setHours(12, 0, 0, 0);

                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const dayStr = String(date.getDate()).padStart(2, '0');
                        const timestamp = `${year}-${month}-${dayStr}T12:00:00`;

                        const logData = {
                            ritual_id: parseInt(ritualId),
                            value: value,
                            timestamp: timestamp,
                            metric_type: 'ritual',
                            tag: 'Bulk Entry'
                        };

                        if (cellData.logId && value > 0) {
                            await api.put(`/logs/${cellData.logId}`, logData);
                            updateCount++;
                        } else if (value > 0) {
                            await api.post('/logs/', logData);
                            createCount++;
                        } else if (cellData.logId && value === 0) {
                            await api.delete(`/logs/${cellData.logId}`);
                        }
                    }
                }
            }

            alert(`Successfully saved! Created: ${createCount}, Updated: ${updateCount}`);
            await fetchWeekLogs();
        } catch (e) {
            console.error(e);
            alert('Failed to save logs');
        } finally {
            setLoading(false);
        }
    };

    const previousWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    const daysOfWeek = getDaysOfWeek();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Bulk Weekly Input</h2>
                <div className="flex items-center gap-2">
                    <Button onClick={previousWeek} variant="outline" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium min-w-[150px] text-center">
                        Week of {formatDateDisplay(currentWeekStart)}
                    </div>
                    <Button onClick={nextWeek} variant="outline" size="icon">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button onClick={fetchWeekLogs} variant="outline" size="icon" title="Refresh">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Ritual Entry</CardTitle>
                    <CardDescription>
                        Edit values to update logs. Set to 0 to delete. Highlighted cells have existing data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky left-0 bg-card z-10 min-w-[150px]">
                                        Ritual
                                    </TableHead>
                                    <TableHead className="text-center">Target</TableHead>
                                    {daysOfWeek.map((day, idx) => (
                                        <TableHead key={idx} className="text-center min-w-[100px]">
                                            {formatDayHeader(day)}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rituals.map((ritual) => (
                                    <TableRow key={ritual.id}>
                                        <TableCell className="font-medium sticky left-0 bg-card z-10">
                                            {ritual.name}
                                        </TableCell>
                                        <TableCell className="text-center text-muted-foreground">
                                            {ritual.target_value}
                                        </TableCell>
                                        {daysOfWeek.map((day, dayIdx) => {
                                            const dateStr = formatDate(day);
                                            const cellData = weekData[ritual.id]?.[dateStr];
                                            return (
                                                <TableCell key={dayIdx} className="p-2">
                                                    <Input
                                                        type="number"
                                                        className="text-center"
                                                        value={cellData?.value || ''}
                                                        onChange={(e) => handleCellChange(ritual.id, dateStr, e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                        step="1"
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            size="lg"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
