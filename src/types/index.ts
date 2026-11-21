// Add common types used across the application here
export interface ProjectImage {
  src: string;
  alt?: string;
  id?: string;
  /** Intrinsic size; set for videos so the slot keeps its shape before load. */
  width?: number;
  height?: number;
}