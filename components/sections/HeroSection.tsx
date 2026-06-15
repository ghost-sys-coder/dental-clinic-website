import { getClinic } from '@/lib/useClinic';
import HeroSplit from './hero/HeroSplit';
import HeroCentered from './hero/HeroCentered';
import HeroImageBg from './hero/HeroImageBg';

export default function HeroSection() {
  const clinic = getClinic();
  const variant = clinic.hero.variant as string;

  if (variant === 'centered') {
    return <HeroCentered />;
  }

  if (variant === 'image-bg') {
    return <HeroImageBg />;
  }

  // Default: 'split'
  return <HeroSplit />;
}
