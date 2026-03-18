export type Service = {
  id: string;
  name: string;
  details: string;
  image: string;
  meta: string;
};

export const services: Service[] = [
  {
    id: 'delivery',
    name: 'Доставка товарів',
    details: 'Доставляємо матеріали самоскидами 10, 20 і 30 тонн по місту та області.',
    image: '/photos/delivery.jpg',
    meta: 'Газель, ЗИЛ, КамАЗ',
  },
  {
    id: 'manipulator',
    name: 'Послуги маніпулятора',
    details: 'Подача та розвантаження матеріалів на об’єкті з точною подачею в потрібну зону.',
    image: '/photos/manipulator-user.jpg',
    meta: 'Подача та розвантаження на місці',
  },
];
