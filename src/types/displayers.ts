/**
 * Shared TypeScript interfaces for HTML displayer components
 *
 * @since 0.12.8-alpha
 */

/** Observer interface — all displayers implement this */
export interface Observer {
  update(
    subject: object,
    posEvent: string,
    loading: boolean | object | null,
    error: Error | null,
  ): void;
}

/** Minimal position-like shape expected by displayers */
export interface Coords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface PositionLike {
  coords: Coords;
  timestamp?: number;
}

/** Minimal address shape used across displayers */
export interface AddressFields {
  municipio?: string;
  bairro?: string;
  logradouro?: string;
  regiaoMetropolitana?: string;
  [key: string]: string | undefined;
}

/** SIDRA-style statistical record */
export interface SidraRecord {
  municipio_codigo?: string | number;
  populacao?: number;
  [key: string]: unknown;
}
