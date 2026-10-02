/**
 * `srcSet` pairing a display-size variant (pre-generated beside the original
 * as `<name>-<variant>.webp`) with the full-resolution file, so cards decode
 * an image sized for where it's shown while the lightbox still opens the full
 * one. Returns undefined when no smaller variant exists.
 */
export function srcSet(src: string, fullWidth: number | undefined, variant = 1200): string | undefined {
  if (!fullWidth || !src.endsWith(".webp") || fullWidth <= variant) return undefined;
  return `${src.replace(/\.webp$/, `-${variant}.webp`)} ${variant}w, ${src} ${fullWidth}w`;
}
