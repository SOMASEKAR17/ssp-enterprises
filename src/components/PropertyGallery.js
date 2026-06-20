'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function PropertyGallery({ images, gated }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ url: '/placeholder-property.jpg', id: 'placeholder' }];

  return (
    <div className="card overflow-hidden">
      <div className="relative h-72 w-full bg-slate-100 sm:h-[420px]">
        <Image
          src={list[active].url}
          alt="Property photo"
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          priority
        />
        {gated && list.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-3 py-1 text-xs text-white">
            +{list.length - 1} more photos after login
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {list.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActive(idx)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md ring-2 ${
                active === idx ? 'ring-brand-600' : 'ring-transparent'
              }`}
            >
              <Image src={img.url} alt="Thumbnail" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
