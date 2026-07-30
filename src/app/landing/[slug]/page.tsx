import { notFound } from "next/navigation";
import LandingPage from "@/components/LandingPage";

export async function generateStaticParams() {
  return [];
}

export default async function LandingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let landingData = null;
  let initialData = null;

  try {
    const { default: sql } = await import("@/lib/db");

    // Get landing page settings
    const pages = await sql(`SELECT * FROM landing_pages WHERE slug = $1 AND is_active = true`, [slug]);
    if (pages.length === 0) return notFound();
    landingData = pages[0];

    // Get products, services, reviews
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

    // Override with landing page settings
    const lp = landingData as any;
    if (lp.hero_title) settingsMap.hero_title = lp.hero_title;
    if (lp.hero_subtitle) settingsMap.hero_subtitle = lp.hero_subtitle;
    if (lp.hero_label) settingsMap.hero_label = lp.hero_label;
    if (lp.hero_points?.length) settingsMap.hero_points = JSON.stringify(lp.hero_points);
    if (lp.form_title) settingsMap.form_title = lp.form_title;
    if (lp.form_subtitle) settingsMap.form_subtitle = lp.form_subtitle;
    if (lp.form_button) settingsMap.form_button = lp.form_button;
    if (lp.form_success) settingsMap.form_success = lp.form_success;
    if (lp.section_products_label) settingsMap.section_products_label = lp.section_products_label;
    if (lp.section_products_title) settingsMap.section_products_title = lp.section_products_title;
    if (lp.section_services_label) settingsMap.section_services_label = lp.section_services_label;
    if (lp.section_reviews_label) settingsMap.section_reviews_label = lp.section_reviews_label;
    if (lp.section_reviews_title) settingsMap.section_reviews_title = lp.section_reviews_title;
    if (lp.contact_strip_label) settingsMap.contact_strip_label = lp.contact_strip_label;
    if (lp.contact_strip_title) settingsMap.contact_strip_title = lp.contact_strip_title;
    if (lp.contacts_label) settingsMap.contacts_label = lp.contacts_label;
    if (lp.contacts_title) settingsMap.contacts_title = lp.contacts_title;

    initialData = { products, services, reviews, settings: settingsMap };
  } catch (e) {
    console.error("Landing page fetch failed:", e);
    // Try to load without landing page settings
    try {
      const { default: sql } = await import("@/lib/db");
      const [products, services, reviews, settings] = await Promise.all([
        sql(`SELECT * FROM products ORDER BY sort_order ASC`),
        sql(`SELECT * FROM services ORDER BY sort_order ASC`),
        sql(`SELECT * FROM reviews ORDER BY sort_order ASC`),
        sql(`SELECT * FROM site_settings`),
      ]);
      const settingsMap: Record<string, string> = {};
      (settings as any[]).forEach((s: any) => settingsMap[s.key] = s.value);
      initialData = { products, services, reviews, settings: settingsMap };
    } catch {}
  }

  return <LandingPage initialData={initialData} />;
}
