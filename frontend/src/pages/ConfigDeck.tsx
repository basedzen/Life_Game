import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Trash2, Plus, ChevronUp, ChevronDown, Edit2, Check, X } from 'lucide-react';
import { IconSelector, getIconComponent } from '@/components/IconSelector';

interface Ritual {
    id?: number;
    name: string;
    target_value: number;
    unit: string;
    period: string;
    sort_order?: number;
    icon?: string;
    default_tag?: string;
}

interface Quota {
    id?: number;
    name: string;
    unit: string;
    category?: string;
    icon?: string;
    label?: string;
    sort_order?: number;
}

interface Reward {
    roll_number: number;
    reward_description: string;
    rarity: string;
}

export const ConfigDeck: React.FC = () => {
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [quotas, setQuotas] = useState<Quota[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [newRitual, setNewRitual] = useState<Ritual>({ name: '', target_value: 0, unit: 'mins', period: 'weekly', icon: '📖' });
    const [newQuota, setNewQuota] = useState<Quota>({ name: '', unit: 'count', category: '', icon: '🍷', label: '' });
    const [diceThreshold, setDiceThreshold] = useState<string>("75");
    const [editingRitual, setEditingRitual] = useState<number | null>(null);
    const [editingQuota, setEditingQuota] = useState<number | null>(null);
    const [editedRitual, setEditedRitual] = useState<Ritual | null>(null);
    const [editedQuota, setEditedQuota] = useState<Quota | null>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    const fetchConfig = async () => {
        const r = await api.get('/config/rituals');
        setRituals(r.data.sort((a: Ritual, b: Ritual) => (a.sort_order || 0) - (b.sort_order || 0)));
        const q = await api.get('/quotas/');
        setQuotas(q.data.sort((a: Quota, b: Quota) => (a.sort_order || 0) - (b.sort_order || 0)));
        const rw = await api.get('/config/rewards');
        setRewards(rw.data);
        const dt = await api.get('/config/settings/dice_threshold');
        if (dt.data) setDiceThreshold(dt.data.value);

        // Fetch tags for autocomplete
        try {
            const t = await api.get('/logs/tags');
            setAvailableTags(t.data);
        } catch (e) {
            console.error("Failed to fetch tags", e);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleAddRitual = async () => {
        await api.post('/config/rituals', { ...newRitual, sort_order: rituals.length });
        setNewRitual({ name: '', target_value: 0, unit: 'mins', period: 'weekly', icon: '📖' });
        fetchConfig();
    };

    const handleDeleteRitual = async (id: number) => {
        await api.delete(`/config/rituals/${id}`);
        fetchConfig();
    };

    const handleUpdateRitual = async (ritual: Ritual) => {
        if (ritual.id) {
            await api.put(`/config/rituals/${ritual.id}`, ritual);
            setEditingRitual(null);
            setEditedRitual(null);
            fetchConfig();
        }
    };

    const handleMoveRitual = async (index: number, direction: 'up' | 'down') => {
        const newRituals = [...rituals];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newRituals.length) return;

        [newRituals[index], newRituals[targetIndex]] = [newRituals[targetIndex], newRituals[index]];

        const ritual_ids = newRituals.map(r => r.id!);
        await api.post('/config/rituals/reorder', { ritual_ids });
        fetchConfig();
    };

    const handleAddQuota = async () => {
        await api.post('/quotas/', { ...newQuota, sort_order: quotas.length });
        setNewQuota({ name: '', unit: 'count', category: '', icon: 'Wine', label: '' });
        fetchConfig();
    };

    const handleDeleteQuota = async (id: number) => {
        await api.delete(`/quotas/${id}`);
        fetchConfig();
    };

    const handleUpdateQuota = async (quota: Quota) => {
        if (quota.id) {
            await api.put(`/quotas/${quota.id}`, quota);
            setEditingQuota(null);
            setEditedQuota(null);
            fetchConfig();
        }
    };

    const handleMoveQuota = async (index: number, direction: 'up' | 'down') => {
        const newQuotas = [...quotas];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newQuotas.length) return;

        [newQuotas[index], newQuotas[targetIndex]] = [newQuotas[targetIndex], newQuotas[index]];

        const quota_ids = newQuotas.map(q => q.id!);
        await api.post('/quotas/reorder', { quota_ids });
        fetchConfig();
    };

    const handleUpdateReward = async (roll: number, desc: string) => {
        await api.post('/config/rewards', { roll_number: roll, reward_description: desc, rarity: 'Common' });
        fetchConfig();
    };

    const handleUpdateDiceThreshold = async () => {
        await api.post('/config/settings', { key: 'dice_threshold', value: diceThreshold });
        fetchConfig();
    };

    const [version, setVersion] = useState<{ commit: string; buildTime: string } | null>(null);

    useEffect(() => {
        fetch('/version.json')
            .then(res => res.json())
            .then(data => setVersion(data))
            .catch(() => setVersion({ commit: 'unknown', buildTime: 'unknown' }));
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>

            <Tabs defaultValue="rituals" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rituals">Rituals</TabsTrigger>
                    <TabsTrigger value="quotas">Quotas</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="rituals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ritual Configuration</CardTitle>
                            <CardDescription>Manage your weekly rituals and targets</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-4 space-y-2">
                                    <Label htmlFor="ritual-name">Name</Label>
                                    <Input
                                        id="ritual-name"
                                        value={newRitual.name}
                                        onChange={e => setNewRitual({ ...newRitual, name: e.target.value })}
                                        placeholder="e.g. Meditation"
                                    />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="ritual-target">Target</Label>
                                    <Input
                                        id="ritual-target"
                                        type="number"
                                        value={newRitual.target_value}
                                        onChange={e => setNewRitual({ ...newRitual, target_value: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="ritual-unit">Unit</Label>
                                    <Input
                                        id="ritual-unit"
                                        value={newRitual.unit}
                                        onChange={e => setNewRitual({ ...newRitual, unit: e.target.value })}
                                        placeholder="mins"
                                    />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label>Icon</Label>
                                    <IconSelector
                                        value={newRitual.icon}
                                        onValueChange={icon => setNewRitual({ ...newRitual, icon })}
                                    />
                                </div>
                                <div className="col-span-12 space-y-2">
                                    <Label htmlFor="ritual-default-tag">Default Tag (for Bulk Entry)</Label>
                                    <Input
                                        id="ritual-default-tag"
                                        list="tag-suggestions"
                                        value={newRitual.default_tag || ''}
                                        onChange={e => setNewRitual({ ...newRitual, default_tag: e.target.value })}
                                        placeholder="e.g. Gym, Reading"
                                    />
                                    <datalist id="tag-suggestions">
                                        {availableTags.map(tag => (
                                            <option key={tag} value={tag} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="col-span-2 flex items-end">
                                    <Button onClick={handleAddRitual} className="w-full">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {rituals.map((r, index) => (
                                    <div key={r.id} className="flex items-center gap-2 p-3 border rounded-lg">
                                        {editingRitual === r.id ? (
                                            <>
                                                <div className="flex-1 grid grid-cols-4 gap-2">
                                                    <Input
                                                        value={editedRitual?.name || ''}
                                                        onChange={e => setEditedRitual({ ...editedRitual!, name: e.target.value })}
                                                        placeholder="Name"
                                                    />
                                                    <Input
                                                        type="number"
                                                        value={editedRitual?.target_value || 0}
                                                        onChange={e => setEditedRitual({ ...editedRitual!, target_value: parseFloat(e.target.value) })}
                                                        placeholder="Target"
                                                    />
                                                    <Input
                                                        value={editedRitual?.unit || ''}
                                                        onChange={e => setEditedRitual({ ...editedRitual!, unit: e.target.value })}
                                                        placeholder="Unit"
                                                    />
                                                    <IconSelector
                                                        value={editedRitual?.icon}
                                                        onValueChange={icon => setEditedRitual({ ...editedRitual!, icon })}
                                                    />
                                                    <Input
                                                        list="tag-suggestions"
                                                        value={editedRitual?.default_tag || ''}
                                                        onChange={e => setEditedRitual({ ...editedRitual!, default_tag: e.target.value })}
                                                        placeholder="Default Tag"
                                                    />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="default"
                                                    onClick={() => handleUpdateRitual(editedRitual!)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingRitual(null);
                                                        setEditedRitual(null);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                {(() => {
                                                    const Icon = getIconComponent(r.icon);
                                                    return <Icon className="h-5 w-5 text-muted-foreground" />;
                                                })()}
                                                <div className="flex-1">
                                                    <div className="font-semibold">{r.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {r.target_value} {r.unit} / {r.period}
                                                        {r.default_tag && <span className="ml-2 text-xs bg-muted px-1 rounded">Tag: {r.default_tag}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => handleMoveRitual(index, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => handleMoveRitual(index, 'down')}
                                                        disabled={index === rituals.length - 1}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingRitual(r.id!);
                                                            setEditedRitual({ ...r });
                                                        }}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => r.id && handleDeleteRitual(r.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quotas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quota Configuration</CardTitle>
                            <CardDescription>Track your quotas and limits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="quota-name">Name</Label>
                                    <Input
                                        id="quota-name"
                                        value={newQuota.name}
                                        onChange={e => setNewQuota({ ...newQuota, name: e.target.value })}
                                        placeholder="e.g. Alcohol"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="quota-unit">Unit</Label>
                                    <Input
                                        id="quota-unit"
                                        value={newQuota.unit}
                                        onChange={e => setNewQuota({ ...newQuota, unit: e.target.value })}
                                        placeholder="count"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="quota-icon">Icon</Label>
                                    <IconSelector
                                        value={newQuota.icon}
                                        onValueChange={icon => setNewQuota({ ...newQuota, icon })}
                                    />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label htmlFor="quota-label">Label (Optional)</Label>
                                    <Input
                                        id="quota-label"
                                        value={newQuota.label || ''}
                                        onChange={e => setNewQuota({ ...newQuota, label: e.target.value })}
                                        placeholder="Custom label"
                                    />
                                </div>
                                <div className="col-span-2 flex items-end">
                                    <Button onClick={handleAddQuota} className="w-full">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {quotas.map((q, index) => {
                                    const IconComponent = getIconComponent(q.icon);

                                    return (
                                        <div key={q.id} className="flex items-center gap-2 p-3 border rounded-lg">
                                            {editingQuota === q.id ? (
                                                <>
                                                    <div className="flex-1 grid grid-cols-4 gap-2">
                                                        <Input
                                                            value={editedQuota?.name || ''}
                                                            onChange={e => setEditedQuota({ ...editedQuota!, name: e.target.value })}
                                                            placeholder="Name"
                                                        />
                                                        <Input
                                                            value={editedQuota?.unit || ''}
                                                            onChange={e => setEditedQuota({ ...editedQuota!, unit: e.target.value })}
                                                            placeholder="Unit"
                                                        />
                                                        <IconSelector
                                                            value={editedQuota?.icon}
                                                            onValueChange={icon => setEditedQuota({ ...editedQuota!, icon })}
                                                        />
                                                        <Input
                                                            value={editedQuota?.label || ''}
                                                            onChange={e => setEditedQuota({ ...editedQuota!, label: e.target.value })}
                                                            placeholder="Label"
                                                        />
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="default"
                                                        onClick={() => handleUpdateQuota(editedQuota!)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingQuota(null);
                                                            setEditedQuota(null);
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <IconComponent className="h-5 w-5" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold">{q.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {q.unit}{q.label ? ` • ${q.label}` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => handleMoveQuota(index, 'up')}
                                                            disabled={index === 0}
                                                        >
                                                            <ChevronUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => handleMoveQuota(index, 'down')}
                                                            disabled={index === quotas.length - 1}
                                                        >
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingQuota(q.id!);
                                                                setEditedQuota({ ...q });
                                                            }}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => q.id && handleDeleteQuota(q.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rewards" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loot Table (D20)</CardTitle>
                            <CardDescription>Configure rewards for each dice roll</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                                <h3 className="font-semibold mb-2">Dice Settings</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="dice-threshold">Unlock Threshold (%)</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                id="dice-threshold"
                                                type="number"
                                                value={diceThreshold}
                                                onChange={e => setDiceThreshold(e.target.value)}
                                                placeholder="75"
                                            />
                                            <Button onClick={handleUpdateDiceThreshold}>Save</Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Percentage of weekly rituals required to unlock the dice.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => {
                                    const reward = rewards.find(r => r.roll_number === num);
                                    return (
                                        <div key={num} className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center border rounded-md font-bold">
                                                {num}
                                            </div>
                                            <Input
                                                className="flex-1"
                                                placeholder="Reward Description..."
                                                defaultValue={reward?.reward_description || ''}
                                                onBlur={(e) => handleUpdateReward(num, e.target.value)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {version && (
                <div className="text-xs text-muted-foreground text-center mt-8">
                    Build: {version.commit.substring(0, 7)} ({version.buildTime})
                </div>
            )}
        </div>
    );
};
