"use client";

import React, { useState } from 'react';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ThumbnailImage = ({ src, alt, className }: ThumbnailImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  // Fallback to high-quality internet images if database link fails
  const fallback = 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=200&auto=format&fit=crop';

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setCurrentSrc(fallback);
    }
  };

  return (
    <img 
      src={currentSrc || fallback} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  );
};
