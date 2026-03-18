export type Product = {
  id: string;
  name: string;
  spec: string;
  priceFrom: string;
  description: string;
  image: string;
  details: string[];
};

export const products: Product[] = [
  {
    id: 'shheben',
    name: 'Щебень',
    spec: 'Фракции 5-20, 20-40, 40-70 мм',
    priceFrom: 'от 920 грн/т',
    description: 'Для бетона, подсыпки, дренажа и дорожных работ.',
    image: '/photos/shheben.jpg',
    details: ['Навалом и с доставкой', 'Для частных и коммерческих объектов', 'Подходит под фундамент и дорогу'],
  },
  {
    id: 'pesok',
    name: 'Песок',
    spec: 'Карьерный и мытый',
    priceFrom: 'от 690 грн/т',
    description: 'Для растворов, стяжки, засыпки и общестроительных задач.',
    image: '/photos/pesok-user.jpg',
    details: ['Карьерный и мытый песок', 'Подача самосвалом на объект', 'Для раствора, стяжки и кладки'],
  },
  {
    id: 'granodsev',
    name: 'Гранодсев',
    spec: 'Фракция 0-5 мм',
    priceFrom: 'от 760 грн/т',
    description: 'Под плитку, благоустройство и выравнивание основания.',
    image: '/photos/granodsev-user.png',
    details: ['Фракция 0-5 мм', 'Для плитки и благоустройства', 'Ровная подсыпка под основание'],
  },
  {
    id: 'kolca-kolodeznye',
    name: 'Кольца колодезные',
    spec: 'КС 10-9, КС 15-9',
    priceFrom: 'от 1800 грн/шт',
    description: 'Колодезные кольца с надежной геометрией и прочностью.',
    image: '/photos/kolca.jpg',
    details: ['Популярные размеры КС 10-9 и КС 15-9', 'Доставка и выгрузка на объект', 'Для колодцев и инженерных сетей'],
  },
  {
    id: 'shlakoblok',
    name: 'Шлакоблок',
    spec: 'Стеновой и перегородочный',
    priceFrom: 'от 52 грн/шт',
    description: 'Практичный материал для перегородок и хозяйственных построек.',
    image: '/photos/shlakoblok-user.jpg',
    details: ['Стеновой и перегородочный формат', 'Для гаражей, ограждений и хозпостроек', 'Партии под розницу и опт'],
  },
  {
    id: 'cement',
    name: 'Цемент',
    spec: 'М400 и М500',
    priceFrom: 'от 158 грн/мешок',
    description: 'Свежий цемент для кладки, бетона и ремонтных работ.',
    image: '/photos/cement.jpg',
    details: ['Марки М400 и М500', 'Мешки для частного и проф. использования', 'Для кладки, бетона и ремонта'],
  },
];
