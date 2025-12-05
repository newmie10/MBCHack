// Share utilities for generating shareable images
import html2canvas from 'html2canvas';

export async function captureNewspaper(elementId: string = 'newspaper-capture'): Promise<Blob | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Newspaper element not found');
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#f5f0e6',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  } catch (error) {
    console.error('Error capturing newspaper:', error);
    return null;
  }
}

export async function downloadNewspaper(elementId: string = 'newspaper-capture'): Promise<boolean> {
  const blob = await captureNewspaper(elementId);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `daily-oracle-${new Date().toISOString().split('T')[0]}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
}

export async function shareNewspaper(
  elementId: string = 'newspaper-capture',
  title?: string,
  subtitle?: string
): Promise<boolean> {
  const blob = await captureNewspaper(elementId);
  if (!blob) return false;

  const file = new File([blob], 'daily-oracle.png', { type: 'image/png' });
  
  const shareText = `📰 Tomorrow's Headlines from The Daily Oracle\n\n${title ? `Top Story: ${title}\n` : ''}${subtitle ? `${subtitle}\n\n` : ''}Powered by Polymarket • Built on Base`;

  // Check if native sharing is available
  if (navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "Tomorrow's Headlines",
        text: shareText,
        files: [file],
      });
      return true;
    } catch (error) {
      // User cancelled or share failed, fall back to download
      console.log('Share cancelled or failed:', error);
    }
  }

  // Fallback: download the image
  return downloadNewspaper(elementId);
}

export function copyShareLink(headline?: string): void {
  const text = `📰 Tomorrow's Headlines from The Daily Oracle\n\n${headline ? `"${headline}"\n\n` : ''}Read tomorrow's news today: https://tomorrowsheadlines.xyz\n\nPowered by Polymarket • Built on Base`;
  
  navigator.clipboard.writeText(text).then(() => {
    // Could trigger a toast notification here
    console.log('Copied to clipboard');
  });
}

