import { useEffect, useRef, useState } from 'react';

type Props = {
  width: number;
  height: number;
  children: React.ReactNode;
};

export default function ResponsiveCanvasWrapper({
  width,
  height,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const scaleX = containerWidth / width;
      const scaleY = containerHeight / height;
      setScale(Math.min(scaleX, scaleY, 1)); // 최대 1까지만 확대
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width, height]);

  return (
    <div ref={containerRef} className='w-full'>
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width,
          height,
        }}
      >
        {children}
      </div>
    </div>
  );
}
