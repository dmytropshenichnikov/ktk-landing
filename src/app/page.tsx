'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';

import { companyName, contacts, socialLinks } from '@/config/site';
import { products } from '@/data/products';
import { reviews } from '@/data/reviews';
import { services } from '@/data/services';

import styles from './page.module.css';

type FormData = {
  name: string;
  phone: string;
  product: string;
  message: string;
};

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const initialFormData: FormData = {
  name: '',
  phone: '',
  product: products[0] ? `${products[0].name} (${products[0].spec})` : '',
  message: '',
};

const phoneRegex = /^[0-9+()\s-]{8,20}$/;

const heroPoints = ['Щебень, песок, гранодсев, кольца, шлакоблок, цемент', 'Доставка по городу и области', 'Услуги манипулятора'] as const;

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorText, setErrorText] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phoneRegex.test(formData.phone.trim())) {
      setStatus('error');
      setErrorText('Проверьте номер телефона. Разрешены только цифры и символы + ( ) -');
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
          product: formData.product,
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus('error');
        setErrorText(payload?.error ?? 'Не удалось отправить заявку. Попробуйте еще раз.');
        return;
      }

      setStatus('success');
      setFormData(initialFormData);
    } catch {
      setStatus('error');
      setErrorText('Ошибка сети. Проверьте подключение и попробуйте еще раз.');
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
                <small>Продажа и доставка строительных материалов</small>
              </span>
            </a>

            <nav className={styles.nav}>
              <a href="#products">Товары</a>
              <a href="#services">Услуги</a>
              <a href="#reviews">Отзывы</a>
              <a href="#contact-form">Заявка</a>
            </nav>

            <div className={styles.headerContacts}>
              <a href={socialLinks.phone}>{contacts.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero} id="hero">
          <div className={styles.heroImage}>
            <Image src="/photos/kamaz-hero.jpg" alt="КамАЗ для доставки строительных материалов" fill priority sizes="100vw" />
          </div>
          <div className={styles.heroShade} />

          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>Доставка строительных материалов</p>
                <h1>Простой и понятный сервис по доставке будматериалов</h1>
                <p className={styles.heroText}>
                  Щебень, песок, гранодсев, кольца колодезные, шлакоблок и цемент с доставкой по городу и области.
                </p>

                <div className={styles.heroPhones}>
                  <a href={socialLinks.phone}>{contacts.phoneDisplay}</a>
                  <a href={socialLinks.viber} target="_blank" rel="noreferrer">
                    Viber
                  </a>
                  <a href={socialLinks.telegram} target="_blank" rel="noreferrer">
                    Telegram
                  </a>
                </div>

                <ul className={styles.heroList}>
                  {heroPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <form className={styles.heroForm} id="contact-form" onSubmit={handleSubmit}>
                <h2>Оставить заявку</h2>
                <p>Напишите, что нужно привезти, и мы быстро свяжемся с вами.</p>

                <input
                  id="hero-name"
                  name="name"
                  type="text"
                  placeholder="Ваше имя"
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
                <select id="hero-product" name="product" value={formData.product} onChange={handleChange}>
                  {products.map((product) => (
                    <option key={product.id} value={`${product.name} (${product.spec})`}>
                      {product.name} ({product.spec})
                    </option>
                  ))}
                </select>
                <textarea
                  id="hero-message"
                  name="message"
                  rows={4}
                  placeholder="Комментарий к заказу"
                  value={formData.message}
                  onChange={handleChange}
                />

                <button type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Отправляем...' : 'Отправить заявку'}
                </button>

                {status === 'success' && <p className={styles.success}>Заявка отправлена. Мы скоро свяжемся с вами.</p>}
                {status === 'error' && <p className={styles.error}>{errorText}</p>}
              </form>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.introBox}>
              <div>
                <p className={styles.sectionLabel}>О компании</p>
                <h2>Все основные материалы в одном месте</h2>
              </div>
              <p>
                Без сложной витрины и лишнего дизайна. На сайте собраны основные позиции, услуги доставки и удобные
                способы связи, чтобы клиенту было просто оставить заявку и быстро получить расчет.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="products">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionLabel}>Товары</p>
              <h2>Основные позиции</h2>
            </div>

            <div className={styles.productsGrid}>
              {products.map((product) => (
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
                      Уточнить цену
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
              <p className={styles.sectionLabel}>Услуги</p>
              <h2>Доставка и манипулятор</h2>
            </div>

            <div className={styles.servicesGrid}>
              {services.map((service) => (
                <article key={service.id} className={styles.serviceCard}>
                  <div className={styles.serviceImage}>
                    <Image src={service.image} alt={service.name} fill sizes="(max-width: 900px) 100vw, 50vw" />
                  </div>
                  <div className={styles.serviceBody}>
                    <p className={styles.serviceMeta}>{service.meta}</p>
                    <h3>{service.name}</h3>
                    <p>{service.details}</p>
                    <a className={styles.cardLink} href="#contact-form">
                      Заказать услугу
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
              <p className={styles.sectionLabel}>Отзывы</p>
              <h2>Что говорят клиенты</h2>
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
                <p className={styles.sectionLabelLight}>Связь</p>
                <h2>Быстро ответим по телефону, в Viber или Telegram</h2>
              </div>

              <div className={styles.contactButtons}>
                <a href={socialLinks.phone}>Телефон</a>
                <a href={socialLinks.viber} target="_blank" rel="noreferrer">
                  Viber
                </a>
                <a href={socialLinks.telegram} target="_blank" rel="noreferrer">
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="contacts">
          <div className={styles.container}>
            <div className={styles.contactsBox}>
              <div>
                <p className={styles.sectionLabel}>Контакты</p>
                <h2>Свяжитесь с нами удобным способом</h2>
              </div>

              <div className={styles.contactInfo}>
                <p>
                  <strong>Телефон</strong>
                  <span>{contacts.phoneDisplay}</span>
                </p>
                <p>
                  <strong>График</strong>
                  <span>{contacts.workingHours}</span>
                </p>
                <p>
                  <strong>Регион доставки</strong>
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
          <p>Щебень, песок, гранодсев, кольца, шлакоблок, цемент</p>
        </div>
      </footer>

      <div className={styles.mobileDock}>
        <a href={socialLinks.phone}>Телефон</a>
        <a href={socialLinks.viber} target="_blank" rel="noreferrer">
          Viber
        </a>
        <a href={socialLinks.telegram} target="_blank" rel="noreferrer">
          Telegram
        </a>
      </div>
    </div>
  );
}
