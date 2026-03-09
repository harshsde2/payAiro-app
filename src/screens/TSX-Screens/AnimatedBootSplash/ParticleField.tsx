import React from "react";
import { Circle } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";

interface ParticleConfig {
  orbitRadius: number;
  orbitSpeed: number;
  phaseOffset: number;
  size: number;
}

const PARTICLES: ParticleConfig[] = [
  { orbitRadius: 45, orbitSpeed: 0.9, phaseOffset: 0, size: 3 },
  { orbitRadius: 70, orbitSpeed: 1.2, phaseOffset: 0.628, size: 5 },
  { orbitRadius: 55, orbitSpeed: 1.0, phaseOffset: 1.257, size: 4 },
  { orbitRadius: 95, orbitSpeed: 1.5, phaseOffset: 1.885, size: 6 },
  { orbitRadius: 40, orbitSpeed: 0.8, phaseOffset: 2.513, size: 3.5 },
  { orbitRadius: 80, orbitSpeed: 1.3, phaseOffset: 3.142, size: 5.5 },
  { orbitRadius: 60, orbitSpeed: 1.1, phaseOffset: 3.77, size: 4 },
  { orbitRadius: 105, orbitSpeed: 1.6, phaseOffset: 4.398, size: 6.5 },
  { orbitRadius: 50, orbitSpeed: 0.95, phaseOffset: 5.027, size: 3.5 },
  { orbitRadius: 75, orbitSpeed: 1.4, phaseOffset: 5.655, size: 5 },
];

const Particle = React.memo(({
  p,
  orbitProgress,
  convergeProgress,
  centerX,
  centerY,
}: {
  p: ParticleConfig;
  orbitProgress: SharedValue<number>;
  convergeProgress: SharedValue<number>;
  centerX: number;
  centerY: number;
}) => {
  const cx = useDerivedValue(() => {
    "worklet";
    const angle = orbitProgress.value * 6.2832 * p.orbitSpeed + p.phaseOffset;
    const ox = centerX + Math.cos(angle) * p.orbitRadius;
    return ox + (centerX - ox) * convergeProgress.value;
  });

  const cy = useDerivedValue(() => {
    "worklet";
    const angle = orbitProgress.value * 6.2832 * p.orbitSpeed + p.phaseOffset;
    const oy = centerY + Math.sin(angle) * p.orbitRadius;
    return oy + (centerY - oy) * convergeProgress.value;
  });

  const r = useDerivedValue(() => {
    "worklet";
    const pulse = 0.6 + 0.4 * Math.sin(orbitProgress.value * 12.5664 + p.phaseOffset);
    return p.size * pulse * (1 - convergeProgress.value);
  });

  const alpha = useDerivedValue(() => {
    "worklet";
    return Math.min(orbitProgress.value * 3, 1) * (1 - convergeProgress.value);
  });

  return <Circle cx={cx} cy={cy} r={r} color="white" opacity={alpha} />;
});

interface ParticleFieldProps {
  orbitProgress: SharedValue<number>;
  convergeProgress: SharedValue<number>;
  centerX: number;
  centerY: number;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  orbitProgress,
  convergeProgress,
  centerX,
  centerY,
}) => {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <Particle
          key={i}
          p={p}
          orbitProgress={orbitProgress}
          convergeProgress={convergeProgress}
          centerX={centerX}
          centerY={centerY}
        />
      ))}
    </>
  );
};

export default React.memo(ParticleField);
