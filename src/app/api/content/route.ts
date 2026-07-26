import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    let [products, services, reviews, settings] = await Promise.all([
      sql(`SELECT * FROM products ORDER BY sort_order ASC`),
      sql(`SELECT * FROM services ORDER BY sort_order ASC`),
      sql(`SELECT * FROM reviews ORDER BY sort_order ASC`),
      sql(`SELECT * FROM site_settings`),
    ]);

    // Auto-seed if DB is empty (first run)
    if (!products?.length && !services?.length && !reviews?.length) {
      try {
        const { default: seedSql } = await import("@/lib/db");
        // Insert default products
        const defaultProducts = [
          { slug: "shheben", name: "Щебінь", spec: "Фракції 5-20, 20-40, 40-70 мм", price_from: "від 1200 грн/т", description: "Для бетону, підсипки, дренажу та дорожніх робіт.", image: "/photos/shheben.jpg", details: ["Навалом і з доставкою", "Для приватних і комерційних об'єктів", "Підходить під фундамент і дорогу"] },
          { slug: "pesok", name: "Пісок", spec: "Кар'єрний і митий", price_from: "від 400 грн/т", description: "Для розчинів, стяжки, засипки та загальнобудівельних задач.", image: "/photos/pesok-user.jpg", details: ["Кар'єрний і митий пісок", "Подача самоскидом на об'єкт", "Для розчину, стяжки та кладки"] },
          { slug: "granodsev", name: "Гранодсів", spec: "Фракція 0-5 мм", price_from: "від 590 грн/т", description: "Під плитку, благоустрій і вирівнювання основи.", image: "/photos/granodsev-user.png", details: ["Фракція 0-5 мм", "Для плитки та благоустрою", "Рівна підсипка під основу"] },
          { slug: "kolca-kolodeznye", name: "Кільця колодязні", spec: "КС 10-9, КС 15-9", price_from: "від 1200 грн/шт", description: "Колодязні кільця з надійною геометрією та міцністю.", image: "/photos/kolca.jpg", details: ["Популярні розміри КС 10-9 і КС 15-9", "Доставка та вивантаження на об'єкт", "Для колодязів та інженерних мереж"] },
          { slug: "shlakoblok", name: "Шлакоблок", spec: "Стеновий і перегородковий", price_from: "від 45 грн/шт", description: "Практичний матеріал для перегородок і господарських будівель.", image: "/photos/shlakoblok-user.jpg", details: ["Стеновий і перегородковий формат", "Для гаражів, огорож і господарських споруд", "Партії в роздріб і оптом"] },
        ];
        for (const p of defaultProducts) {
          await seedSql(`INSERT INTO products (slug,name,spec,price_from,description,image,details,sort_order,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,true) ON CONFLICT (slug) DO NOTHING`,
            [p.slug, p.name, p.spec, p.price_from, p.description, p.image, p.details, 0]);
        }
        // Refresh data
        [products, services, reviews, settings] = await Promise.all([
          sql(`SELECT * FROM products ORDER BY sort_order ASC`),
          sql(`SELECT * FROM services ORDER BY sort_order ASC`),
          sql(`SELECT * FROM reviews ORDER BY sort_order ASC`),
          sql(`SELECT * FROM site_settings`),
        ]);
      } catch (seedError) {
        console.error("Auto-seed failed:", seedError);
      }
    }

    const settingsMap: Record<string, string> = {};
    (settings as any[]).forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ products, services, reviews, settings: settingsMap });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
