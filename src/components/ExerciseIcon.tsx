import React from 'react';
import {
  User,
  Dumbbell,
  Footprints,
  Hand,
  Flame,
  Activity,
  HeartPulse,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ExerciseIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const ExerciseIcon: React.FC<ExerciseIconProps> = ({
  name,
  className = 'w-5 h-5',
  size,
}) => {
  const iconProps = { className, ...(size ? { size } : {}) };

  switch (name) {
    case 'person':
    case 'user':
      return <User {...iconProps} />;
    case 'fitness_center':
    case 'dumbbell':
      return <Dumbbell {...iconProps} />;
    case 'accessibility':
    case 'accessibility_new':
      return <Activity {...iconProps} />;
    case 'directions_walk':
    case 'walk':
      return <Footprints {...iconProps} />;
    case 'directions_run':
    case 'run':
      return <Zap {...iconProps} />;
    case 'sports_gymnastics':
    case 'gymnastics':
      return <Flame {...iconProps} />;
    case 'back_hand':
    case 'hand':
      return <Hand {...iconProps} />;
    case 'self_improvement':
    case 'zen':
      return <HeartPulse {...iconProps} />;
    default:
      return <Sparkles {...iconProps} />;
  }
};
