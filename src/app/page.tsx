'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';

import styles from './page.module.css';

// SVG Icons
import { IconCheck, IconPhone, IconViber, IconWhatsApp, IconClock, IconTruck, IconPackage, IconStar, IconArrowRight, IconMail, IconQuote, IconHammer, IconCrane, IconBuilding } from '@/components/icons';

type FormData = {
  name: string;
  phone: string;
  email: string;
  product: string;
  message: string;
};

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const phoneRegex = /^[0-9+()\s-]{8,20}$/;

export default function Home() {
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', email: '', product: '', message: '' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorText, setErrorText] = useState('');
  const [showPhoneMenu, setShowPhoneMenu] = useState(false);
  
  // Dynamic data from DB
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [dbSettings, setDbSettings] = useState<Record<string,string>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Fetch dynamic content from DB
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        if (data?.products) setDbProducts(data.products);
        if (data?.services) setDbServices(data.services);
        if (data?.reviews) setDbReviews(data.reviews);
        if (data?.settings) setDbSettings(data.settings);
        setDataLoaded(true);
      })
      .catch(() => setDataLoaded(true));
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const gapi = (window as any).gapi;
      if (gapi) {
        gapi.load('surveyoptin', function() {
          gapi.surveyoptin.render({
            "merchant_id": 5698959504,
            "order_id": `ORDER_${Date.now()}`,
            "email": formData.email || "customer@example.com",
            "delivery_country": "UA",
            "estimated_delivery_date": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          });
        });
      }
    }
  }, [status, formData.email]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phoneRegex.test(formData.phone.trim())) {
      setStatus('error');
      setErrorText('Перевірте номер телефону. Дозволені тільки цифри та символи + ( ) -');
      return;
    }

    setStatus('sending');
    setErrorText('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          product: formData.product,
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus('error');
        setErrorText(payload?.error ?? 'Не вдалося відправити заявку. Спробуйте ще раз.');
        return;
      }

      setStatus('success');
      const gtag = (window as any).gtag;
      if (gtag) {
        gtag('event', 'conversion', { 'send_to': 'AW-18199730227/GCUlCImBpswcELOwp-ZD' });
      }
    } catch {
      setStatus('error');
      setErrorText("Помилка мережі. Перевірте з'єднання та спробуйте ще раз.");
    }
  };

  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const gtagFn = (window as any).gtag_report_conversion;
    if (gtagFn) {
      e.preventDefault();
      gtagFn(e.currentTarget.href);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topLine}>
        <div className={styles.container}>
          <p>{dbSettings.company_name || "ТОВ \"КТК\""}</p>
          <p><IconClock size={14} /> {dbSettings.working_hours || "Пн-Сб: 08:00-18:00"}</p>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <a className={styles.brand} href="#hero">
              <span>
                <strong>{dbSettings.company_name || "ТОВ \"КТК\""}</strong>
                <small>Продаж і доставка будівельних матеріалів</small>
              </span>
            </a>

            <nav className={styles.nav}>
              <a href="#products">Товари</a>
              <a href="#services">Послуги</a>
              <a href="#reviews">Відгуки</a>
              <a href="#contact-form">Заявка</a>
            </nav>

            <div className={styles.headerContacts}>
              <a href={("tel:" + (dbSettings.phone_raw || "+380503044777"))} onClick={handlePhoneClick}>{dbSettings.phone_display || "050 304 4777"}</a>
              <a href={("tel:" + (dbSettings.phone_raw2 || "+380661102829"))} onClick={handlePhoneClick}>{dbSettings.phone_display2 || "066 110 2829"}</a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} id="hero">
          <div className={styles.heroImage}>
            <Image src="/photos/kamaz-hero.jpg" alt="КамАЗ для доставки будівельних матеріалів" fill priority sizes="100vw" />
          </div>
          <div className={styles.heroShade} />

          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>Доставка будівельних матеріалів</p>
                <h1>Сервіс із професійною доставкою будматеріалів</h1>
                <p className={styles.heroText}>
                  Щебінь, пісок, гранодсів, кільця колодязні та шлакоблок з доставкою по місту та області.
                </p>

                <div className={styles.heroPhones}>
                  <a href={`tel:${dbSettings.phone_raw || "+380503044777"}` onClick={handlePhoneClick}>{dbSettings.phone_display || "050 304 4777"</a>
                  <a href={`tel:${dbSettings.phone_raw2 || "+380661102829"}` onClick={handlePhoneClick}>{dbSettings.phone_display2 || "066 110 2829"</a>
                  <a href={`viber://chat?number=${encodeURIComponent(dbSettings.phone_raw || "+380503044777")}` target="_blank" rel="noreferrer">
                    Viber
                  </a>
                  <a href={("https://wa.me/" + (dbSettings.phone_raw || "+380503044777").replace(/[^0-9]/g, "").replace(/^0/, "380")")} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </div>

                <ul className={styles.heroList}>
                  {heroPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <form className={styles.heroForm} id="contact-form" onSubmit={handleSubmit}>
                <h2>Залишити заявку</h2>
                <p>Напишіть, що потрібно привезти, і ми швидко зв&apos;яжемося з вами.</p>

                <input
                  id="hero-name"
                  name="name"
                  type="text"
                  placeholder="Ваше ім'я"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  id="hero-phone"
                  name="phone"
                  type="tel"
                  placeholder="+380..."
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <input
                  id="hero-email"
                  name="email"
                  type="email"
                  placeholder="Email (для відгуку Google)"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <select id="hero-product" name="product" value={formData.product} onChange={handleChange}>
                  {dbProducts.map((product) => (
                    <option key={product.id} value={("product.name + " (" + product.spec + ")")}>
                      {product.name} ({product.spec})
                    </option>
                  ))}
                </select>
                <textarea
                  id="hero-message"
                  name="message"
                  rows={4}
                  placeholder="Коментар до замовлення"
                  value={formData.message}
                  onChange={handleChange}
                />

                <button type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Відправляємо...' : 'Надіслати заявку'}
                </button>

                {status === 'success' && <p className={styles.success}>Заявку відправлено. Ми скоро зв&apos;яжемося з вами.</p>}
                {status === 'error' && <p className={styles.error}>{errorText}</p>}
              </form>
            </div>
          </div>
        </section>

        <section className={styles.section} id="products">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Товари</p>
              <h2>Основні позиції</h2>
            </div>

            <div className={styles.productsGrid}>
              {dbProducts.map((product) => (
                <article key={product.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <Image src={product.image} alt={product.name} fill sizes="(max-width: 900px) 100vw, 33vw" />
                  </div>
                  <div className={styles.productBody}>
                    <h3>{product.name}</h3>
                    <p className={styles.productSpec}>{product.spec}</p>
                    <p className={styles.productPrice}>{product.priceFrom}</p>
                    <p className={styles.productDescription}>{product.description}</p>
                    <a className={styles.cardLink} href="#contact-form">
                      Уточнити ціну
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} id="services">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Послуги</p>
              <h2>Доставка і маніпулятор</h2>
            </div>

            <div className={styles.servicesGrid}>
              {dbServices.map((service) => (
                <article key={service.id} className={styles.serviceCard}>
                  <div className={styles.serviceImage}>
                    <Image src={service.image} alt={service.name} fill sizes="(max-width: 900px) 100vw, 50vw" />
                  </div>
                  <div className={styles.serviceBody}>
                    {service.meta ? <p className={styles.serviceMeta}>{service.meta}</p> : null}
                    <h3>{service.name}</h3>
                    <p>{service.details}</p>
                    <a className={styles.cardLink} href="#contact-form">
                      Замовити послугу
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="reviews">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Відгуки</p>
              <h2>Що кажуть клієнти</h2>
            </div>

            <div className={styles.reviewsGrid}>
              {dbReviews.map((review) => (
                <article key={review.name} className={styles.reviewCard}>
                  <div className={styles.reviewHead}>
                    <div className={styles.reviewAvatar}>
                      <Image src={review.image} alt={review.name} fill sizes="80px" />
                    </div>
                    <div>
                      <h3>{review.name}</h3>
                      <p>{review.role}</p>
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.contactStrip}>
          <div className={styles.container}>
            <div className={styles.contactStripBox}>
              <div>
                <p className={styles.sectionLabelLight}>Зв&apos;язок</p>
                <h2>Швидко відповімо телефоном, у Viber або WhatsApp</h2>
              </div>

              <div className={styles.contactButtons}>
                <a href={`tel:${dbSettings.phone_raw || "+380503044777"}` onClick={handlePhoneClick}>{dbSettings.phone_display || "050 304 4777"</a>
                <a href={`tel:${dbSettings.phone_raw2 || "+380661102829"}` onClick={handlePhoneClick}>{dbSettings.phone_display2 || "066 110 2829"</a>
                <a href={`viber://chat?number=${encodeURIComponent(dbSettings.phone_raw || "+380503044777")}` target="_blank" rel="noreferrer">
                  Viber
                </a>
                <a href={("https://wa.me/" + (dbSettings.phone_raw || "+380503044777").replace(/[^0-9]/g, "").replace(/^0/, "380")")} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="contacts">
          <div className={styles.container}>
            <div className={styles.contactsBox}>
              <div>
                <p className={styles.sectionLabel}>Контакти</p>
                <h2>Зв&apos;яжіться з нами зручним способом</h2>
              </div>

              <div className={styles.contactInfo}>
                <p>
                  <strong>Телефон</strong>
                  <span>
                    <a href={`tel:${dbSettings.phone_raw || "+380503044777"}` className={styles.contactLink} onClick={handlePhoneClick}>{dbSettings.phone_display || "050 304 4777"</a>
                    <br />
                    <a href={`tel:${dbSettings.phone_raw2 || "+380661102829"}` className={styles.contactLink} onClick={handlePhoneClick}>{dbSettings.phone_display2 || "066 110 2829"</a>
                  </span>
                </p>
                <p>
                  <strong>Графік</strong>
                  <span>{dbSettings.working_hours || "Пн-Сб: 08:00-18:00"</span>
                </p>
                <p>
                  <strong>Регіон доставки</strong>
                  <span>{dbSettings.delivery_area || "Полтава та область"</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>{dbSettings.company_name || "ТОВ \"КТК\""}</p>
          <p>Щебінь, пісок, гранодсів, кільця, шлакоблок</p>
        </div>
      </footer>

      <div className={styles.mobileDock}>
        <button onClick={() => setShowPhoneMenu(true)} className={styles.dockButton}>
          Телефон
        </button>
        <a href={`viber://chat?number=${encodeURIComponent(dbSettings.phone_raw || "+380503044777")}` target="_blank" rel="noreferrer">
          Viber
        </a>
        <a href={("https://wa.me/" + (dbSettings.phone_raw || "+380503044777").replace(/[^0-9]/g, "").replace(/^0/, "380")")} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>

      {showPhoneMenu && (
        <div className={styles.modalBackdrop} onClick={() => setShowPhoneMenu(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Оберіть номер телефону</h3>
            <div className={styles.modalLinks}>
              <a href={`tel:${dbSettings.phone_raw || "+380503044777"}` className={styles.modalPhoneLink} onClick={(e) => { handlePhoneClick(e); setShowPhoneMenu(false); }}>
                <IconPhone size={16} /> {dbSettings.phone_display || "050 304 4777"
              </a>
              <a href={`tel:${dbSettings.phone_raw2 || "+380661102829"}` className={styles.modalPhoneLink} onClick={(e) => { handlePhoneClick(e); setShowPhoneMenu(false); }}>
                <IconPhone size={16} /> {dbSettings.phone_display2 || "066 110 2829"
              </a>
            </div>
            <button className={styles.modalCloseButton} onClick={() => setShowPhoneMenu(false)}>
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
