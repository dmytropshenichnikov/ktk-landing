import { NextResponse } from "next/server";
import sql from "@/lib/db";

const defaultProducts = [
  { slug: "shheben", name: "Щебінь", spec: "Фракції 5-20, 20-40, 40-70 мм", price_from: "від 1200 грн/т", description: "Для бетону, підсипки, дренажу та дорожніх робіт.", image: "/photos/shheben.jpg", details: ["Навалом і з доставкою", "Для приватних і комерційних об'єктів", "Підходить під фундамент і дорогу"] },
  { slug: "pesok", name: "Пісок", spec: "Кар'єрний і митий", price_from: "від 400 грн/т", description: "Для розчинів, стяжки, засипки та загальнобудівельних задач.", image: "/photos/pesok-user.jpg", details: ["Кар'єрний і митий пісок", "Подача самоскидом на об'єкт", "Для розчину, стяжки та кладки"] },
  { slug: "granodsev", name: "Гранодсів", spec: "Фракція 0-5 мм", price_from: "від 590 грн/т", description: "Під плитку, благоустрій і вирівнювання основи.", image: "/photos/granodsev-user.png", details: ["Фракція 0-5 мм", "Для плитки та благоустрою", "Рівна підсипка під основу"] },
  { slug: "kolca-kolodeznye", name: "Кільця колодязні", spec: "КС 10-9, КС 15-9", price_from: "від 1200 грн/шт", description: "Колодязні кільця з надійною геометрією та міцністю.", image: "/photos/kolca.jpg", details: ["Популярні розміри КС 10-9 і КС 15-9", "Доставка та вивантаження на об'єкт", "Для колодязів та інженерних мереж"] },
  { slug: "shlakoblok", name: "Шлакоблок", spec: "Стеновий і перегородковий", price_from: "від 45 грн/шт", description: "Практичний матеріал для перегородок і господарських будівель.", image: "/photos/shlakoblok-user.jpg", details: ["Стеновий і перегородковий формат", "Для гаражів, огорож і господарських споруд", "Партії в роздріб і оптом"] },
];

const defaultServices = [
  { slug: "delivery", name: "Доставка товарів", details: "Доставляємо матеріали самоскидами 10, 20 і 30 тонн по місту та області.", image: "/photos/delivery.jpg", meta: "" },
  { slug: "manipulator", name: "Послуги маніпулятора", details: "Подача та розвантаження матеріалів на об'єкті з точною подачею в потрібну зону.", image: "/photos/manipulator-user.jpg", meta: "Подача та розвантаження на місці" },
];

const defaultReviews = [
  { name: "Олександр Мельник", role: "Приватне будівництво", text: "Замовляв щебінь і пісок для фундаменту. Швидко погодили обсяг, машину подали вчасно, матеріал приїхав без затримок.", image: "/reviews/review-1.jpg" },
  { name: "Ірина Коваль", role: "Благоустрій ділянки", text: "Потрібен був гранодсів і доставка на ділянку. Усе пояснили простими словами, допомогли вибрати потрібний обсяг і привезли у зручний час.", image: "/reviews/review-2.jpg" },
  { name: "Сергій Бондар", role: "Підрядні роботи", text: "Беремо тут шлакоблок, цемент і інколи маніпулятор. Зручно, що можна закрити одразу і товар, і доставку без зайвих дзвінків.", image: "/reviews/review-3.jpg" },
];

const defaultSettings: Record<string, string> = {
  company_name: "ТОВ \"КТК\"",
  phone_display: "050 304 4777",
  phone_raw: "+380503044777",
  phone_display2: "066 110 2829",
  phone_raw2: "+380661102829",
  working_hours: "Пн-Сб: 08:00-18:00",
  delivery_area: "Полтава та область",
  hero_title: "Сервіс із професійною доставкою будматеріалів",
  hero_subtitle: "Щебінь, пісок, гранодсів, кільця колодязні та шлакоблок з доставкою по місту та області.",
  form_title: "Залишити заявку",
  form_subtitle: "Напишіть, що потрібно привезти, і ми швидко зв'яжемося з вами.",
  form_button: "Надіслати заявку",
  form_success: "Заявку відправлено. Ми скоро зв'яжемося з вами.",
};

export async function GET() {
  try {
    let count = { products: 0, services: 0, reviews: 0, settings: 0 };

    // Seed products
    for (const p of defaultProducts) {
      await sql(`INSERT INTO products (slug, name, spec, price_from, description, image, details, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (slug) DO NOTHING`,
        [p.slug, p.name, p.spec, p.price_from, p.description, p.image, p.details, 0]);
      count.products++;
    }

    // Seed services
    for (const s of defaultServices) {
      await sql(`INSERT INTO services (slug, name, details, image, meta, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO NOTHING`,
        [s.slug, s.name, s.details, s.image, s.meta, 0]);
      count.services++;
    }

    // Seed reviews
    for (const r of defaultReviews) {
      await sql(`INSERT INTO reviews (name, role, text, image, sort_order)
        VALUES ($1,$2,$3,$4,$5)`,
        [r.name, r.role, r.text, r.image, 0]);
      count.reviews++;
    }

    // Seed settings
    for (const [key, value] of Object.entries(defaultSettings)) {
      await sql(`INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING`,
        [key, value]);
      count.settings++;
    }

    return NextResponse.json({ success: true, message: "Data seeded", count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
