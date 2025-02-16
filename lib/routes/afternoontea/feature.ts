import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/feature',
    categories: ['shopping'],
    example: '/shop/pages/feature_index.aspx',
    name: 'News',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    let url = 'https://shop.afternoon-tea.net/shop/pages/feature_index.aspx';

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('.feature-item')
        .toArray()
        .map((ele) => {
            const item = $(ele)
            return {
                title: item.find('h3').text(),
                link: `https://shop.afternoon-tea.net${item.find('a').attr('href')}`,
                description: item.find('.all_text_').text(),
                date: item.find('.date').text(),
                image: `https://shop.afternoon-tea.net${item.find('img').attr('src')}`
            }
        })

    return {
        title: 'Afternoon Tea - 新着商品',
        link: url,
        item: items,
    };
}
