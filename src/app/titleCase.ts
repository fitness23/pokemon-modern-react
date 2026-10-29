/** Same output as Angular's `titlecase` pipe: first letter of each word upper-cased, the rest lower-cased. */
export function titleCase(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
