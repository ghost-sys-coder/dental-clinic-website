import { clinic, type ClinicConfig } from '@/config/clinic.config';
import { themes } from '@/config/themes';

export function useClinic(): ClinicConfig {
  return clinic;
}

export function getClinic(): ClinicConfig {
  return clinic;
}

export function getTheme() {
  return themes[clinic.brand.themePreset as keyof typeof themes];
}
