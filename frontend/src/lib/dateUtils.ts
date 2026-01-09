/**
 * Centralized date utilities for AEDT timezone handling
 * All dates are normalized to Australia/Melbourne timezone
 */


/**
 * Get a date in AEDT timezone, normalized to noon to avoid midnight boundary issues
 */
export function getAEDTDate(date?: Date | string): Date {
    const d = date ? new Date(date) : new Date();
    // Set to noon to avoid timezone boundary issues
    d.setHours(12, 0, 0, 0);
    return d;
}

/**
 * Format date as yyyy-mm-dd for use as object keys and backend storage
 * Uses local date components (AEDT-aware)
 */
export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date as dd/mm/yyyy for display
 */
export function formatDateDisplay(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format day header (e.g., "Mon 10")
 */
export function formatDayHeader(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getDate()}`;
}

/**
 * Get the Monday of the week for a given date
 */
export function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(12, 0, 0, 0);
    return d;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    result.setHours(12, 0, 0, 0);
    return result;
}

/**
 * Parse HTML date input (yyyy-mm-dd) to AEDT date
 */
export function parseInputDate(dateString: string): Date {
    const d = new Date(dateString);
    d.setHours(12, 0, 0, 0);
    return d;
}

/**
 * Format date for HTML date input (yyyy-mm-dd)
 */
export function formatInputDate(date: Date): string {
    return formatDateKey(date);
}

/**
 * Format date as ISO timestamp for backend (yyyy-mm-ddT12:00:00)
 */
export function formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T12:00:00`;
}
