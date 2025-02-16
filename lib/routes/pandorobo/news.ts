import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news',
    categories: ['shopping'],
    example: '/pandorobo/news/',
    name: 'News',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    let url = 'https://ehon.kadokawa.co.jp/pandorobo/news/';

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('.list-news__020 .item')
        .toArray()
        .map((ele) => {
            const item = $(ele)
            const image = `https://ehon.kadokawa.co.jp${item.find('.image-inner img').attr('src')}`;
            return {
                title: item.find('.text').text(),
                link: item.find('.commodityName').first().attr('href'),
                date: item.find('.date').text(),
                image: image,
                description: `<div><img src="${image}"></div>`,
            }
        })

    return {
        title: 'パンどろぼう - ニュースいちらん',
        link: url,
        item: items,
    };
}
