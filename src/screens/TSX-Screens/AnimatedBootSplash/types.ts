export interface IParticle {
  id: number;
  startX: number;
  startY: number;
  orbitRadius: number;
  orbitSpeed: number;
  phaseOffset: number;
  size: number;
}

export interface IAnimatedBootSplashProps {
  onAnimationEnd: () => void;
}

export interface IAnimatedBootSplashV2Props {
  onAnimationEnd: () => void;
}

export interface IAnimatedBootSplashV3Props {
  onAnimationEnd: () => void;
}

export interface IParticleFieldProps {
  progress: { value: number };
  convergeProgress: { value: number };
  centerX: number;
  centerY: number;
}

export interface ILogoRevealProps {
  drawProgress: { value: number };
  fillOpacity: { value: number };
  centerX: number;
  centerY: number;
  logoScale: number;
}
