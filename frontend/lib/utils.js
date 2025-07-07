// A simple utility for conditionally joining Tailwind classes
// This is a minimal version, not directly copying shadcn's 'cn'
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}