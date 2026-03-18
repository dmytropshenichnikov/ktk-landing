export const companyName = 'ТОВ "КТК"';

export const contacts = {
  phoneDisplay: '+38 (067) 123-45-67',
  phoneRaw: '+380671234567',
  viberRaw: '+380671234567',
  telegramUsername: 'ktk_manager',
  workingHours: 'Пн-Сб: 08:00-18:00',
  deliveryArea: 'Полтава та область',
} as const;

export const socialLinks = {
  phone: `tel:${contacts.phoneRaw}`,
  viber: `viber://chat?number=${encodeURIComponent(contacts.viberRaw)}`,
  telegram: `https://t.me/${contacts.telegramUsername}`,
} as const;
