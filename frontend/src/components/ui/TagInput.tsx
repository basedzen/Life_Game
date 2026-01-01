import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { api } from '@/api';

interface TagInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ id, value, onChange, placeholder }) => {
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.get<string[]>('/logs/tags').then(res => {
            setAvailableTags(res.data);
        }).catch((err: unknown) => console.error("Failed to fetch tags", err));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const newCursorPosition = e.target.selectionStart || 0;
        onChange(newValue);
        setCursorPosition(newCursorPosition);

        updateSuggestions(newValue, newCursorPosition);
    };

    const updateSuggestions = (text: string, position: number) => {
        const textBeforeCursor = text.slice(0, position);
        const words = textBeforeCursor.split(/\s+/);
        const currentWord = words[words.length - 1];

        // Only suggest if word starts with #
        if (currentWord && currentWord.startsWith('#')) {
            const search = currentWord.toLowerCase();
            const matches = availableTags.filter(tag =>
                tag.toLowerCase().startsWith(search) && tag.toLowerCase() !== search
            );
            setSuggestions(matches);
            setShowSuggestions(matches.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        const textBeforeCursor = value.slice(0, cursorPosition);
        const textAfterCursor = value.slice(cursorPosition);

        const words = textBeforeCursor.split(/\s+/);
        words.pop(); // Remove the partial word

        // Reconstruct string: words before + suggestion + space + words after
        const prefix = words.length > 0 ? words.join(' ') + ' ' : '';
        const newValue = prefix + suggestion + ' ' + textAfterCursor;

        onChange(newValue);
        setShowSuggestions(false);

        // Focus back
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div className="relative">
            <Input
                id={id}
                ref={inputRef}
                value={value}
                onChange={handleInputChange}
                onKeyUp={(e) => {
                    // Update cursor position on arrow keys
                    if (e.currentTarget.selectionStart !== null) {
                        setCursorPosition(e.currentTarget.selectionStart);
                        updateSuggestions(value, e.currentTarget.selectionStart);
                    }
                }}
                onClick={(e) => {
                    if (e.currentTarget.selectionStart !== null) {
                        setCursorPosition(e.currentTarget.selectionStart);
                        updateSuggestions(value, e.currentTarget.selectionStart);
                    }
                }}
                placeholder={placeholder}
                autoComplete="off"
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-40 overflow-y-auto bg-white dark:bg-slate-950">
                    {suggestions.map(tag => (
                        <div
                            key={tag}
                            className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur before click
                                handleSuggestionClick(tag);
                            }}
                        >
                            {tag}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
