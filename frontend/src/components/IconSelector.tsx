import React from 'react';
import { Select, SelectContent, SelectTrigger } from '@/components/ui/select';

import { ALL_EMOJIS } from './emoji-list';

// Use the full list of emojis
export const AVAILABLE_ICONS = ALL_EMOJIS;

interface IconSelectorProps {
    value?: string;
    onValueChange: (value: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ value, onValueChange }) => {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full font-emoji">
                <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ fontFamily: '"Noto Emoji", sans-serif' }}>{value || "❓"}</span>
                    <span className="font-sans">{value ? "Selected" : "Select Icon"}</span>
                </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                <div className="grid grid-cols-8 gap-1 p-2">
                    {AVAILABLE_ICONS.map((icon, index) => (
                        <div
                            key={`${icon}-${index}`}
                            className={`flex items-center justify-center p-2 rounded cursor-pointer hover:bg-accent text-xl ${value === icon ? 'bg-accent' : ''}`}
                            onClick={() => onValueChange(icon)}
                            style={{ fontFamily: '"Noto Emoji", sans-serif' }}
                        >
                            {icon}
                        </div>
                    ))}
                </div>
            </SelectContent>
        </Select>
    );
};

// Helper to render the icon (emoji)
// Returns a component that renders the emoji
export const getIconComponent = (iconChar?: string) => {
    // Legacy mapping for old Lucide icon names if they still exist in DB
    const legacyMap: Record<string, string> = {
        'Wine': '🍷', 'Pill': '💊', 'Cigarette': '🚬', 'Coffee': '☕', 'Utensils': '🍴',
        'Dumbbell': '🏋️', 'Book': '📖', 'Code': '💻', 'Heart': '❤️', 'Brain': '🧠',
        'Activity': '🏃', 'Key': '🔑', 'Briefcase': '💼', 'Palette': '🎨', 'Home': '🏠',
        'Users': '👥', 'Gamepad': '🎮', 'Languages': '🗣️', 'Flame': '🔥',
        'Bike': '🚴', 'Footprints': '👣', 'Waves': '🌊', 'Mountain': '⛰️',
        'Music': '🎵', 'Brush': '🖌️', 'Camera': '📷',
        'Pen': '🖊️', 'Calculator': '🧮', 'Microscope': '🔬', 'GraduationCap': '🎓', 'Laptop': '💻', 'Target': '🎯',
        'Beer': '🍺', 'Pizza': '🍕', 'Apple': '🍎', 'Carrot': '🥕', 'CupSoda': '🥤', 'Cake': '🍰', 'Droplets': '💧',
        'CreditCard': '💳', 'DollarSign': '💲', 'Gift': '🎁', 'Phone': '📱', 'Tv': '📺', 'Bed': '🛌', 'Bath': '🛁', 'Clock': '⏰',
        'Sun': '☀️', 'Moon': '🌙', 'Cloud': '☁️', 'Trees': '🌲', 'Flower': '🌸', 'Star': '⭐', 'Zap': '⚡',
        'Ghost': '👻', 'Skull': '💀', 'Trophy': '🏆', 'Medal': '🥇', 'Crown': '👑', 'Sword': '⚔️', 'Shield': '🛡️', 'Map': '🗺️', 'Compass': '🧭', 'Anchor': '⚓'
    };

    const emoji = (iconChar && legacyMap[iconChar]) ? legacyMap[iconChar] : (iconChar || '❓');

    return ({ className }: { className?: string }) => (
        <span
            className={className}
            style={{
                fontFamily: '"Noto Emoji", sans-serif',
                fontSize: '1.2em',
                lineHeight: 1,
                fontStyle: 'normal'
            }}
        >
            {emoji}
        </span>
    );
};
