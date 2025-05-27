// SVG 관련 유틸리티
export const createSVGPath = (
  center: { x: number; y: number },
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const x1 = center.x + radius * Math.cos(startAngle);
  const y1 = center.y + radius * Math.sin(startAngle);
  const x2 = center.x + radius * Math.cos(endAngle);
  const y2 = center.y + radius * Math.sin(endAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};
