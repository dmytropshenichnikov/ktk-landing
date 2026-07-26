// Fetch site data from API (with cache)
let cache: any = null;
let cacheTime = 0;

export async function getSiteData() {
  const now = Date.now();
  // Cache for 5 minutes
  if (cache && now - cacheTime < 300000) return cache;
  
  try {
    const res = await fetch("https://ktkpoltava.com.ua/api/content", { 
      next: { revalidate: 300 } 
    });
    if (res.ok) {
      cache = await res.json();
      cacheTime = now;
      return cache;
    }
  } catch (e) {
    console.error("Failed to fetch site data:", e);
  }
  
  // Fallback to empty
  return { products: [], services: [], reviews: [], settings: {} };
}
