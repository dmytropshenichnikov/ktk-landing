export const companyName = 'ТОВ "КТК"';

export const contacts = {
  phoneDisplay: '050 304 4777',
  phoneRaw: '+380503044777',
  viberRaw: '+380503044777',
  telegramUsername: 'ktk_manager',
  workingHours: 'Пн-Сб: 08:00-18:00',
  deliveryArea: 'Полтава та область',
} as const;

export const socialLinks = {
  phone: `tel:${contacts.phoneRaw}`,
  viber: `viber://chat?number=${encodeURIComponent(contacts.viberRaw)}`,
  telegram: `https://t.me/${contacts.telegramUsername}`,
} as const;
