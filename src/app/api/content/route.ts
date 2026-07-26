import { NextResponse } from "next/server";
import sql from "@/lib/db";

async function autoMigrate() {
  try {
    await sql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`);
  } catch (_) {}
  try {
    await sql(`DELETE FROM reviews WHERE id NOT IN (SELECT MIN(id) FROM reviews GROUP BY name, text)`);
  } catch (_) {}
  try {
    await sql(`CREATE UNIQUE INDEX IF NOT EXISTS reviews_name_text_idx ON reviews (name, text)`);
  } catch (_) {}
}

export async function GET() {
  try {
    // Auto-migrate on every start
    await autoMigrate();
    
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
        // Also insert default reviews and services (with dedup)
        const defaultReviews = [
          { name: "Олександр Мельник", role: "Приватне будівництво", text: "Замовляв щебінь і пісок для фундаменту. Швидко погодили обсяг, машину подали вчасно, матеріал приїхав без затримок.", image: "/reviews/review-1.jpg" },
          { name: "Ірина Коваль", role: "Благоустрій ділянки", text: "Потрібен був гранодсів і доставка на ділянку. Усе пояснили простими словами, допомогли вибрати потрібний обсяг і привезли у зручний час.", image: "/reviews/review-2.jpg" },
          { name: "Сергій Бондар", role: "Підрядні роботи", text: "Беремо тут шлакоблок, цемент і інколи маніпулятор. Зручно, що можна закрити одразу і товар, і доставку без зайвих дзвінків.", image: "/reviews/review-3.jpg" },
        ];
        await seedSql(`DELETE FROM reviews WHERE id NOT IN (SELECT MIN(id) FROM reviews GROUP BY name, text)`).catch(()=>{});
    for (const r of defaultReviews) {
          await seedSql(`INSERT INTO reviews (name, role, text, image, sort_order) VALUES($1,$2,$3,$4,$5) ON CONFLICT (name, text) DO NOTHING`, [r.name, r.role, r.text, r.image, 0]);
        }
        const defaultServices = [
          { slug: "delivery", name: "Доставка товарів", details: "Доставляємо матеріали самоскидами 10, 20 і 30 тонн по місту та області.", image: "/photos/delivery.jpg", meta: "" },
          { slug: "manipulator", name: "Послуги маніпулятора", details: "Подача та розвантаження матеріалів на об'єкті з точною подачею в потрібну зону.", image: "/photos/manipulator-user.jpg", meta: "Подача та розвантаження на місці" },
        ];
        for (const s of defaultServices) {
          await seedSql(`INSERT INTO services (slug, name, details, image, meta, sort_order) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING`, [s.slug, s.name, s.details, s.image, s.meta, 0]);
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
