import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { formatDateDisplay, getAEDTDate, formatInputDate, parseInputDate, formatTimestamp } from '@/lib/dateUtils';
import { TagInput } from '@/components/ui/TagInput';



interface Log {
    id: number;
    ritual_id?: number;
    quota_id?: number;
    timestamp: string;
    value: number;
    tag?: string;
    metric_type: string;
}

interface Ritual {
    id: number;
    name: string;
}

interface Quota {
    id: number;
    name: string;
}

export const LogHistory: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [quotas, setQuotas] = useState<Quota[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Log>>({});

    const fetchData = async () => {
        const logsRes = await api.get('/logs/');
        setLogs(logsRes.data);
        const ritualsRes = await api.get('/config/rituals');
        setRituals(ritualsRes.data);
        const quotasRes = await api.get('/quotas/');
        setQuotas(quotasRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (log: Log) => {
        setEditingId(log.id);
        setEditForm(log);
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            // If timestamp was changed, format it properly for backend
            const updateData = { ...editForm };
            if (editForm.timestamp) {
                const date = parseInputDate(editForm.timestamp as string);
                updateData.timestamp = formatTimestamp(date);
            }

            await api.put(`/logs/${editingId}`, updateData);
            setEditingId(null);
            setEditForm({});
            fetchData();
            alert('Log updated successfully');
        } catch (e) {
            console.error(e);
            alert('Failed to update log');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        try {
            await api.delete(`/logs/${id}`);
            fetchData();
            alert('Log deleted successfully');
        } catch (e) {
            console.error(e);
            alert('Failed to delete log');
        }
    };

    const getRitualName = (id?: number) => {
        if (!id) return '-';
        return rituals.find(r => r.id === id)?.name || `Ritual #${id}`;
    };

    const getQuotaName = (id?: number) => {
        if (!id) return '-';
        return quotas.find(q => q.id === id)?.name || `Quota #${id}`;
    };


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Log History</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Logs</CardTitle>
                    <CardDescription>View and manage your activity logs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Tag</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map(log => (
                                    <TableRow key={log.id}>
                                        {editingId === log.id ? (
                                            <>
                                                <TableCell colSpan={6}>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="edit-date">Date</Label>
                                                                <Input
                                                                    id="edit-date"
                                                                    type="date"
                                                                    value={editForm.timestamp ? formatInputDate(getAEDTDate(editForm.timestamp)) : ''}
                                                                    onChange={e => setEditForm({ ...editForm, timestamp: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="edit-value">Value</Label>
                                                                <Input
                                                                    id="edit-value"
                                                                    type="number"
                                                                    value={editForm.value || 0}
                                                                    onChange={e => setEditForm({ ...editForm, value: parseFloat(e.target.value) })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="edit-tag">Tag</Label>
                                                                <TagInput
                                                                    id="edit-tag"
                                                                    value={editForm.tag || ''}
                                                                    onChange={val => setEditForm({ ...editForm, tag: val })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button onClick={handleSave} size="sm">
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Save
                                                            </Button>
                                                            <Button variant="outline" onClick={() => setEditingId(null)} size="sm">
                                                                <X className="mr-2 h-4 w-4" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell className="font-medium">{formatDateDisplay(getAEDTDate(log.timestamp))}</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.metric_type === 'ritual' ? 'default' : 'secondary'}>
                                                        {log.metric_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {log.ritual_id ? getRitualName(log.ritual_id) : getQuotaName(log.quota_id)}
                                                </TableCell>
                                                <TableCell className="font-bold">{log.value}</TableCell>
                                                <TableCell className="text-muted-foreground">{log.tag || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button onClick={() => handleEdit(log)} variant="outline" size="icon">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button onClick={() => handleDelete(log.id)} variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {logs.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No logs found. Start logging some activities!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
