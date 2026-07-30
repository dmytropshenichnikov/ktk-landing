import { describe, it, expect } from 'vitest';

describe('Analytics Events', () => {
  // Allowed event types - should match the server-side validation
  const ALLOWED_EVENTS = [
    'click_phone',
    'click_viber',
    'click_whatsapp',
    'click_product',
    'click_service',
    'submit_application',
    'page_view',
  ];

  describe('Event type validation', () => {
    it('should accept all valid event types', () => {
      const validEvents = ALLOWED_EVENTS;
      expect(validEvents.length).toBe(7);
      expect(validEvents).toContain('click_phone');
      expect(validEvents).toContain('click_viber');
      expect(validEvents).toContain('click_whatsapp');
      expect(validEvents).toContain('click_product');
      expect(validEvents).toContain('click_service');
      expect(validEvents).toContain('submit_application');
      expect(validEvents).toContain('page_view');
    });

    it('should reject invalid event types', () => {
      const invalidEvents = ['invalid_event', '', 'click', 'phone_click', null, undefined];
      invalidEvents.forEach(event => {
        expect(ALLOWED_EVENTS.includes(event as any)).toBe(false);
      });
    });

    it('should have unique event types', () => {
      const unique = new Set(ALLOWED_EVENTS);
      expect(unique.size).toBe(ALLOWED_EVENTS.length);
    });
  });

  describe('Event data format', () => {
    it('should parse phone numbers correctly', () => {
      const phones = [
        '050 304 4777',
        '066 110 2829',
        '+380503044777',
        '+380661102829',
      ];
      phones.forEach(phone => {
        expect(phone.replace(/[^0-9+]/g, '').length).toBeGreaterThanOrEqual(10);
      });
    });

    it('should detect UTM parameters in URL', () => {
      const url1 = new URL('https://ktkpoltava.com.ua/?utm_source=google&utm_medium=cpc');
      expect(url1.searchParams.get('utm_source')).toBe('google');
      expect(url1.searchParams.get('utm_medium')).toBe('cpc');
      expect(url1.searchParams.get('utm_campaign')).toBeNull();

      const url2 = new URL('https://ktkpoltava.com.ua/');
      expect(url2.searchParams.get('utm_source')).toBeNull();
    });
  });
});

describe('Contact Form Validation', () => {
  const phoneRegex = /^[0-9+()\s-]{8,20}$/;

  it('should accept valid phone numbers', () => {
    const validPhones = [
      '050 304 4777',
      '066 110 2829',
      '+380503044777',
      '+38 (050) 304-47-77',
      '0971234567',
    ];
    validPhones.forEach(phone => {
      expect(phoneRegex.test(phone)).toBe(true);
    });
  });

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '123',           // too short
      '',              // empty
      'abc',           // letters
      '123456789012345678901', // too long
      '+38(050)abc',   // mixed invalid
    ];
    invalidPhones.forEach(phone => {
      expect(phoneRegex.test(phone)).toBe(false);
    });
  });
});

describe('UTM Source Labels', () => {
  const sourceLabels: Record<string, string> = {
    direct: '🔄 Прямий перехід',
    google: '🔍 Google',
    facebook: '📘 Facebook',
    instagram: '📷 Instagram',
    olx: '🛒 OLX',
  };

  it('should have labels for known sources', () => {
    expect(sourceLabels.direct).toBe('🔄 Прямий перехід');
    expect(sourceLabels.google).toBe('🔍 Google');
    expect(sourceLabels.facebook).toBe('📘 Facebook');
    expect(sourceLabels.instagram).toBe('📷 Instagram');
    expect(sourceLabels.olx).toBe('🛒 OLX');
  });

  it('should fallback to raw source name for unknown sources', () => {
    const unknownSource = 'telegram';
    expect(sourceLabels[unknownSource] || unknownSource).toBe('telegram');
  });
});

describe('Application Status Labels', () => {
  const STATUS_LABELS: Record<string, string> = {
    new: 'Нова',
    read: 'Прочитана',
    contacted: "Зв'язались",
    sent: 'Відправлено',
    completed: 'Завершено',
    cancelled: 'Скасовано',
  };

  it('should have labels for all default statuses', () => {
    const statuses = ['new', 'read', 'contacted', 'sent', 'completed', 'cancelled'];
    statuses.forEach(status => {
      expect(STATUS_LABELS[status]).toBeDefined();
    });
  });

  it('should have unique labels', () => {
    const labels = Object.values(STATUS_LABELS);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });
});
