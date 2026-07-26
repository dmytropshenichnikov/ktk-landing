'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';

import styles from './page.module.css';
import { IconPhone, IconViber, IconWhatsApp, IconCheck, IconStar, IconQuote, IconMail, IconUser, IconTruck, IconPackage, IconBuilding, IconHammer, IconCrane, IconArrowRight, IconSend } from '@/components/icons';

// Static fallback data
import { companyName as fallbackCompany, contacts as fallbackContacts, socialLinks as fallbackSocial } from '@/config/site';
import { products as fallbackProducts } from '@/data/products';
import { services as fallbackServices } from '@/data/services';
import { reviews as fallbackReviews } from '@/data/reviews';

type FormData = {
  name: string;
  phone: string;
  email: string;
  product: string;
  message: string;
};

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

// Dynamic data state (fetched from API)
let dynamicProducts: any[] | null = null;
let dynamicServices: any[] | null = null;
let dynamicReviews: any[] | null = null;
let dynamicSettings: Record<string,string> = {};

const phoneRegex = /^[0-9+()\s-]{8,20}$/;

const heroPoints = ['Щебінь, пісок, гранодсів, кільця, шлакоблок', 'Доставка по місту та області', 'Послуги маніпулятора'] as const;

export default function Home() {
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', email: '', product: '', message: '' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorText, setErrorText] = useState('');
  const [showPhoneMenu, setShowPhoneMenu] = useState(false);

  // State for dynamic DB content
  const [dbData, setDbData] = useState<{ products: any[]; services: any[]; reviews: any[]; settings: Record<string,string> } | null>(null);

  // Fetch content from DB - wait for it to avoid image flickering
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        if (data?.products || data?.services || data?.reviews || data?.settings) {
          setDbData(data);
        }
      })
      .catch(() => {})
      .finally(() => setDataReady(true));
  }, []);

  // Don't render until API responds (prevents image flicker from fallback->DB switch)
  if (!dataReady) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: "#666", fontSize: 14 }}>Завантаження...</p>
        </div>
      </div>
    );
  }

  // Use DB data if available, else fallback
  const products = dbData?.products?.length ? dbData.products : fallbackProducts;
  const services = dbData?.services?.length ? dbData.services : fallbackServices;
  const reviews = dbData?.reviews?.length ? dbData.reviews : fallbackReviews;
  const settings = dbData?.settings || {};
  const companyName = settings.company_name || fallbackCompany;
  const contacts = {
    phoneDisplay: settings.phone_display || fallbackContacts.phoneDisplay,
    phoneRaw: settings.phone_raw || fallbackContacts.phoneRaw,
    phoneDisplay2: settings.phone_display2 || fallbackContacts.phoneDisplay2,
    phoneRaw2: settings.phone_raw2 || fallbackContacts.phoneRaw2,
    workingHours: settings.working_hours || fallbackContacts.workingHours,
    deliveryArea: settings.delivery_area || fallbackContacts.deliveryArea,
  };

  const socialLinks = {
    phone: `tel:${contacts.phoneRaw}`,
    phone2: `tel:${contacts.phoneRaw2}`,
    viber: `viber://chat?number=${encodeURIComponent(contacts.phoneRaw)}`,
    whatsapp: `https://wa.me/${contacts.phoneRaw.replace(/[^0-9]/g, '')}`,
  };

  // Set initial product when data loads
  useEffect(() => {
    if (products.length > 0 && !formData.product) {
      setFormData((prev: FormData) => ({ ...prev, product: `${products[0].name} (${products[0].spec})` }));
    }
  }, [products, formData.product]);

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
          <p>{companyName}</p>
          <p>{contacts.workingHours}</p>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <a className={styles.brand} href="#hero">
              <span>
                <strong>{companyName}</strong>
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
              <a href={socialLinks.phone} onClick={handlePhoneClick}>{contacts.phoneDisplay}</a>
              <a href={socialLinks.phone2} onClick={handlePhoneClick}>{contacts.phoneDisplay2}</a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} id="hero">
          <div className={styles.heroImage}>
            <Image src="/photos/kamaz-hero.jpg" alt="КамАЗ для доставки будівельних матеріалів" fill priority sizes="100vw"  />
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
                  <a href={socialLinks.phone} onClick={handlePhoneClick}>{contacts.phoneDisplay}</a>
                  <a href={socialLinks.phone2} onClick={handlePhoneClick}>{contacts.phoneDisplay2}</a>
                  <a href={socialLinks.viber} target="_blank" rel="noreferrer">
                    Viber
                  </a>
                  <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
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
                  <option value="">Оберіть матеріал</option>
                  {products.map((product: any) => (
                    <option key={product.id || product.slug} value={`${product.name} (${product.spec})`}>
                      {product.name} ({product.spec})
                    </option>
                  ))}
                  <option value="Інший (вкажіть у коментарі)">Інший матеріал</option>
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
              {products.map((product) => (
                <article key={product.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <Image src={product.image} alt={product.name} fill sizes="(max-width: 900px) 100vw, 33vw" unoptimized={product.image?.startsWith("data:")} />
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
              {services.map((service) => (
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
              {reviews.map((review) => (
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
                <a href={socialLinks.phone} onClick={handlePhoneClick}>{contacts.phoneDisplay}</a>
                <a href={socialLinks.phone2} onClick={handlePhoneClick}>{contacts.phoneDisplay2}</a>
                <a href={socialLinks.viber} target="_blank" rel="noreferrer">
                  Viber
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
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
                    <a href={socialLinks.phone} className={styles.contactLink} onClick={handlePhoneClick}>{contacts.phoneDisplay}</a>
                    <br />
                    <a href={socialLinks.phone2} className={styles.contactLink} onClick={handlePhoneClick}>{contacts.phoneDisplay2}</a>
                  </span>
                </p>
                <p>
                  <strong>Графік</strong>
                  <span>{contacts.workingHours}</span>
                </p>
                <p>
                  <strong>Регіон доставки</strong>
                  <span>{contacts.deliveryArea}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>{companyName}</p>
          <p>Щебінь, пісок, гранодсів, кільця, шлакоблок</p>
        </div>
      </footer>

      <div className={styles.mobileDock}>
        <button onClick={() => setShowPhoneMenu(true)} className={styles.dockButton}>
          Телефон
        </button>
        <a href={socialLinks.viber} target="_blank" rel="noreferrer">
          Viber
        </a>
        <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>

      {showPhoneMenu && (
        <div className={styles.modalBackdrop} onClick={() => setShowPhoneMenu(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Оберіть номер телефону</h3>
            <div className={styles.modalLinks}>
              <a href={socialLinks.phone} className={styles.modalPhoneLink} onClick={(e) => { handlePhoneClick(e); setShowPhoneMenu(false); }}>
                <IconPhone size={20} /> {contacts.phoneDisplay}
              </a>
              <a href={socialLinks.phone2} className={styles.modalPhoneLink} onClick={(e) => { handlePhoneClick(e); setShowPhoneMenu(false); }}>
                <IconPhone size={20} /> {contacts.phoneDisplay2}
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
