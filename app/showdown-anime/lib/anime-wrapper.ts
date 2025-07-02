// Client-side wrapper for anime.js v3
let animeInstance: any = null;

export async function getAnime() {
  if (animeInstance) return animeInstance;
  
  try {
    if (typeof window !== 'undefined') {
      // Import anime.js v3
      const anime = await import('animejs');
      animeInstance = anime.default || anime;
      return animeInstance;
    }
    return null;
  } catch (error) {
    console.error('Failed to load anime.js:', error);
    return null;
  }
}