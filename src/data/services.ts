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
    name: 'Доставка товаров',
    details: 'Доставляем материалы самосвалами 10, 20 и 30 тонн по городу и области.',
    image: '/photos/delivery.jpg',
    meta: 'Газель, ЗИЛ, КамАЗ',
  },
  {
    id: 'manipulator',
    name: 'Услуги манипулятора',
    details: 'Подача и разгрузка материалов на объекте с точной подачей в нужную зону.',
    image: '/photos/manipulator-user.jpg',
    meta: 'Подача и разгрузка на месте',
  },
];
