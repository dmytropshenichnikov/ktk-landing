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
    name: 'Щебінь',
    spec: 'Фракції 5-20, 20-40, 40-70 мм',
    priceFrom: 'від 1200 грн/т',
    description: 'Для бетону, підсипки, дренажу та дорожніх робіт.',
    image: '/photos/shheben.jpg',
    details: ['Навалом і з доставкою', 'Для приватних і комерційних об’єктів', 'Підходить під фундамент і дорогу'],
  },
  {
    id: 'pesok',
    name: 'Пісок',
    spec: 'Кар’єрний і митий',
    priceFrom: 'від 400 грн/т',
    description: 'Для розчинів, стяжки, засипки та загальнобудівельних задач.',
    image: '/photos/pesok-user.jpg',
    details: ['Кар’єрний і митий пісок', 'Подача самоскидом на об’єкт', 'Для розчину, стяжки та кладки'],
  },
  {
    id: 'granodsev',
    name: 'Гранодсів',
    spec: 'Фракція 0-5 мм',
    priceFrom: 'від 590 грн/т',
    description: 'Під плитку, благоустрій і вирівнювання основи.',
    image: '/photos/granodsev-user.png',
    details: ['Фракція 0-5 мм', 'Для плитки та благоустрою', 'Рівна підсипка під основу'],
  },
  {
    id: 'kolca-kolodeznye',
    name: 'Кільця колодязні',
    spec: 'КС 10-9, КС 15-9',
    priceFrom: 'від 1200 грн/шт',
    description: 'Колодязні кільця з надійною геометрією та міцністю.',
    image: '/photos/kolca.jpg',
    details: ['Популярні розміри КС 10-9 і КС 15-9', 'Доставка та вивантаження на об’єкт', 'Для колодязів та інженерних мереж'],
  },
  {
    id: 'shlakoblok',
    name: 'Шлакоблок',
    spec: 'Стеновий і перегородковий',
    priceFrom: 'від 45 грн/шт',
    description: 'Практичний матеріал для перегородок і господарських будівель.',
    image: '/photos/shlakoblok-user.jpg',
    details: ['Стеновий і перегородковий формат', 'Для гаражів, огорож і господарських споруд', 'Партії в роздріб і оптом'],
  },
];
