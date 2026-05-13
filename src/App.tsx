import React, { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_LOAD: number = 10;
const ALL_TAGS: string[] = ['nature', 'tech', 'city', 'abstract', 'animals'];

interface Image {
  id: string;
  url: string;
  tags: string[];
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isEnd, setIsEnd] = useState<boolean>(false);
  const loader = useRef<HTMLDivElement | null>(null);

  // Generate mock data
  const generateImages = useCallback((count: number): Image[] => {
    return Array.from({ length: count }).map(() => {
      const width = Math.floor(Math.random() * (400 - 200 + 1)) + 200;
      const height = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
      return {
        id: Math.random().toString(36).substring(2, 9),
        url: `https://placehold.co/${width}x${height}`,
        tags: [
          ALL_TAGS[Math.floor(Math.random() * ALL_TAGS.length)],
          ALL_TAGS[Math.floor(Math.random() * ALL_TAGS.length)]
        ].filter((v, i, a) => a.indexOf(v) === i) // unique tags 
      };
    });
  }, []);

  // Initial Load
  useEffect(() => {
    const newImgs = generateImages(INITIAL_LOAD);
    setImages(newImgs);
  }, [generateImages]);

  // Handle Filtering 
  useEffect(() => {
    if (filter) {
      setFilteredImages(images.filter(img => img.tags.includes(filter)));
    } else {
      setFilteredImages(images);
    }
  }, [filter, images]);

  // Infinite Scroll Logic
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setPage((prev) => prev + 1);
      setImages((prev) => [...prev, ...generateImages(5)]);
    }
  }, [generateImages]);

  useEffect(() => {
    const option: IntersectionObserverInit = { threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Image Gallery</h1>
        {filter && (
          <button 
            onClick={() => setFilter(null)}
            className="bg-red-500 text-white px-4 py-1 rounded-full mb-2"
          >
            Clear Filter: #{filter}
          </button>
        )}
      </header>

      {/* Masonry-style Grid [cite: 5, 9] */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {filteredImages.map((img) => (
          <div key={img.id} className="break-inside-avoid mb-4 bg-white rounded-lg shadow-md overflow-hidden">
            <img src={img.url} alt="placeholder" className="w-full h-auto" />
            <div className="p-2">
              {img.tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setFilter(tag)}
                  className="text-blue-500 mr-2 text-sm hover:underline"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger [cite: 4] */}
      {!isEnd && (
        <div ref={loader} className="h-20 flex items-center justify-center">
          <p className="text-gray-500">Loading more...</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;