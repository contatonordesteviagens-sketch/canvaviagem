/**
 * Formats a phone number to Brazilian format: (XX) XXXXX-XXXX
 */
export const formatPhoneBR = (value: string): string => {
  // Remove everything except digits
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 11 digits
  const limited = numbers.slice(0, 11);
  
  // Apply mask based on length
  if (limited.length === 0) return '';
  if (limited.length <= 2) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  if (limited.length <= 10) return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
};

/**
 * Removes all non-digit characters from a phone string
 */
export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Validates if a phone is a valid Brazilian phone number (10-11 digits)
 */
export const isValidBRPhone = (phone: string): boolean => {
  const clean = cleanPhone(phone);
  return clean.length >= 10 && clean.length <= 11;
};
