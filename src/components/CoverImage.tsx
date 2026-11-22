import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
}

export function CoverImage({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[4/3]',
}: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${aspectClass} ${className} flex flex-col items-center justify-center bg-[#EFECE6] text-[#5A6069] select-none`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 stroke-[1.5] mb-2 opacity-60" aria-hidden="true" />
        <span className="text-xs tracking-wide px-4 text-center line-clamp-1 opacity-80">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} overflow-hidden bg-[#F3F4F6] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}
