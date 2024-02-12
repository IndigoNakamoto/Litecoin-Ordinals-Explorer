// utils/formatHelpers.ts
import { isUndefined } from 'lodash';
export const formatTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    // TypeScript should understand these are dates and their subtraction results in a number, 
    // but if you encounter issues, you might need type assertions (not shown here because it should work as is).
    const diff = now.getTime() - date.getTime(); // Using .getTime() to ensure clarity for TypeScript
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    const formattedDate = date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return `${formattedDate}`;
  };
  
  export const formatAgoTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Again, ensuring both dates are converted to number milliseconds.
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let agoText = '';
    if (diffDays > 0) {
        agoText = `${diffDays} Days ${diffHours % 24} Hours ago`;
    } else {
        agoText = `${diffHours} Hours ago`;
    }

    return `${agoText}`;
  };
  
  export function formatLits(value: number | undefined) {
    const num = Number(value)

    if (value === null || isUndefined(value) || isNaN(value)) {
        return '0'
    }

    // Check if the value is zero
    if (num === 0) {
        return '0'
    }

    // Split the number into whole and fractional parts
    let [whole, fraction] = num.toFixed(8).split('.')
    whole += ''
    // Check if the fractional part is all zeros
    if (fraction && /^0+$/.test(fraction)) {
        return whole
    }

    // Format the fractional part with spaces
    if (fraction) {
        fraction =
            fraction.slice(0, 2) +
            ' ' +
            fraction.slice(2, 5) +
            ' ' +
            fraction.slice(5)
    }

    // Combine the whole and fractional parts
    return fraction ? `${whole}.${fraction}` : whole
  }
  
  export function formatContentSize(content_length: any) {
    if (content_length < 1000) {
        return `${content_length} bytes`;
    } else {
        return `${Math.round(content_length / 1000)} KB`;
    }
  }
  