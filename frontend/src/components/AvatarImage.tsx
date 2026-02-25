import { useState } from 'react';
import { Avatar, AvatarImage as AvatarImageUI, AvatarFallback } from '@/components/ui/avatar';
import { ExternalBlob } from '../backend';

interface AvatarImageProps {
  avatar?: ExternalBlob | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  avatarTimestamp?: bigint | number;
}

export default function AvatarImage({ avatar, name, size = 'md', className = '', avatarTimestamp }: AvatarImageProps) {
  const [retryCount, setRetryCount] = useState(0);
  
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

  // Build cache-busted URL
  const getAvatarUrl = () => {
    if (!avatar) return '/assets/generated/default-avatar.dim_256x256.png';
    
    const baseUrl = avatar.getDirectURL();
    const timestamp = avatarTimestamp ? Number(avatarTimestamp) : 0;
    const cacheBuster = `v=${timestamp}&r=${retryCount}`;
    
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${cacheBuster}`;
  };

  const handleImageError = () => {
    // Retry once with a new cache-busting parameter
    if (retryCount === 0) {
      setRetryCount(1);
    }
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className} border-2 border-border`}>
      <AvatarImageUI 
        src={getAvatarUrl()} 
        alt={name}
        className="object-cover"
        onError={handleImageError}
      />
      <AvatarFallback className="bg-gradient-to-br from-[oklch(0.65_0.22_330)] to-[oklch(0.70_0.20_60)] text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
