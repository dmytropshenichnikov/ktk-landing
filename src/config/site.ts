export const companyName = 'ТОВ "КТК"';

export const contacts = {
  phoneDisplay: '050 304 4777',
  phoneRaw: '+380503044777',
  phoneDisplay2: '066 110 2829',
  phoneRaw2: '+380661102829',
  viberRaw: '+380503044777',
  whatsappRaw: '380503044777',
  workingHours: 'Пн-Сб: 08:00-18:00',
  deliveryArea: 'Полтава та область',
} as const;

export const socialLinks = {
  phone: `tel:${contacts.phoneRaw}`,
  phone2: `tel:${contacts.phoneRaw2}`,
  viber: `viber://chat?number=${encodeURIComponent(contacts.viberRaw)}`,
  whatsapp: `https://wa.me/${contacts.whatsappRaw}`,
} as const;
