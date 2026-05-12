"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CollectionImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const CollectionImage = ({ src, alt, className }: CollectionImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  // Definitive fallback list from Unsplash (Reliable Internet Images)
  const fallbacks = [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop', // Skincare set
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop', // Serum bottle
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop', // Product texture
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop'  // Natural skincare
  ];

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      // Try next fallback or the ultimate fallback
      setCurrentSrc(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    }
  };

  useEffect(() => {
    setCurrentSrc(src);
    setIsError(false);
  }, [src]);

  return (
    <img 
      src={currentSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
    />
  );
};
