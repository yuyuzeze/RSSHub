import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/brew',
    categories: ['shopping'],
    example: '',
    name: 'home',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    let url = `https://www.starbucks.co.jp`;

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('div.brew-products a.brew-products__card__inner')

        .toArray()
        .map((ele) => {
            const item = $(ele)
            const image = item.find('div.brew-products__card__inner__img img').attr('src')
            return {
                title: item.find('div.brew-products__card__inner__img img').attr('alt'),
                link: item.attr('href'),
                image: `${image}`,
                description: `<img src="${image}"/><p>${item.find('p.brew-products__card__inner__desc').text()}</p>`,
                pubDate: item.find('span.brew-products__card__inner__time.text-right').text().trim().replace(/\./g, "-")
            }
        })

    return {
        title: 'starbucks - WHAT’S BREWING',
        link: url,
        item: items,
    };
}
