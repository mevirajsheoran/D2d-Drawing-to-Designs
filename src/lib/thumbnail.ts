// Gradient color combinations for thumbnails
const gradientPairs = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a8edea", "#fed6e3"],
  ["#d299c2", "#fef9d7"],
  ["#89f7fe", "#66a6ff"],
  ["#cd9cf2", "#f6f3ff"],
  ["#fddb92", "#d1fdff"],
  ["#a1c4fd", "#c2e9fb"],
  ["#d4fc79", "#96e6a1"],
  ["#84fab0", "#8fd3f4"],
  ["#cfd9df", "#e2ebf0"],
  ["#a6c0fe", "#f68084"],
  ["#ffecd2", "#fcb69f"],
  ["#ff9a9e", "#fecfef"],
  ["#a18cd1", "#fbc2eb"],
  ["#fad0c4", "#ffd1ff"],
  ["#fbc2eb", "#a6c1ee"],
];

/**
 * Generate a random gradient thumbnail as SVG data URL
 */
export function generateGradientThumbnail(): string {
  const randomIndex = Math.floor(Math.random() * gradientPairs.length);
  const [color1, color2] = gradientPairs[randomIndex];
  const gradientId = `gradient-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const angle = Math.floor(Math.random() * 360);

  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" gradientTransform="rotate(${angle})">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#${gradientId})" rx="12" />
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

/**
 * Generate thumbnail from canvas element
 */
export async function generateCanvasThumbnail(
  canvasElement: HTMLCanvasElement,
  quality: number = 0.8
): Promise<string> {
  return canvasElement.toDataURL("image/png", quality);
}

/**
 * Generate a solid color thumbnail
 */
export function generateSolidThumbnail(color: string = "#1a1a2e"): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}" rx="12" />
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}