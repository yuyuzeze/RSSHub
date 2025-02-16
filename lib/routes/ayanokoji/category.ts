import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/category/:cate1/:cate2?/:cate3?',
    categories: ['shopping'],
    example: '/c/00/134?sort=02',
    name: 'カテゴリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const { cate1, cate2 = '', cate3 = '' } = ctx.req.param();
    let url = `https://ayanokoji-onlineshop.jp/c/${cate1}`;
    if (cate2) {
        url += `/${cate2}`;
        if (cate3) {
            url += `/${cate3}`;
        }
    }

    // 将所有查询参数添加到URL
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('.fs-c-productList__list .fs-c-productList__list__item')
        .toArray()
        .map((ele) => {
            const item = $(ele)
            const image = item.find('.fs-c-productListItem__imageContainer img').data('layzr');
            const price = item.find('.fs-c-productListItem__prices .fs-c-price__value').text();
            const start = item.find('.fs-c-time').text();
            return {
                title: item.find('.fs-c-productName__name').text(),
                link: `https://ayanokoji-onlineshop.jp${item.find('.fs-c-productListItem__imageContainer a').attr('href')}`,
                price: price,
                image: image,
                start: start,
                description: `<div><img src="${image}" alt="">Price: ${price}<br>${start ? `Start: ${start}` : ''}</div>`
            }
        })

    return {
        title: 'Ayanokoji - 新着商品',
        link: url,
        item: items,
    };
}
