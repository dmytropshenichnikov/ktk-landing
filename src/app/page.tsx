import LandingPage from "@/components/LandingPage";

export default async function Home() {
  let initialData = null;
  
  try {
    const { default: sql } = await import("@/lib/db");
    
    const [products, services, reviews, settings] = await Promise.all([
      sql(`SELECT * FROM products ORDER BY sort_order ASC`),
      sql(`SELECT * FROM services ORDER BY sort_order ASC`),
      sql(`SELECT * FROM reviews ORDER BY sort_order ASC`),
      sql(`SELECT * FROM site_settings`),
    ]);
    
    const settingsMap: Record<string, string> = {};
    (settings as any[]).forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });
    
    initialData = { products, services, reviews, settings: settingsMap };
  } catch (e) {
    console.error("Server data fetch failed:", e);
  }

  return <LandingPage initialData={initialData} />;
}
