import { Avatar, AvatarImage as AvatarImageUI, AvatarFallback } from '@/components/ui/avatar';
import { ExternalBlob } from '../backend';

interface AvatarImageProps {
  avatar?: ExternalBlob | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function AvatarImage({ avatar, name, size = 'md', className = '' }: AvatarImageProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={`${sizeClasses[size]} ${className} border-2 border-border`}>
      <AvatarImageUI 
        src={avatar?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'} 
        alt={name}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
