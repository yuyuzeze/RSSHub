import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/category/:category',
    categories: ['shopping'],
    example: '/information_cat/news',
    name: 'カテゴリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const category = ctx.req.params.category;
    let url = `https://www.kamiojapan.shop/view/category/${category}`;

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

    const items = $('.category-item-list > li')
        .toArray()
        .map((element) => {
            const item = $(element)
            const image = item.find('.category-item-img img').attr('src')
            const price = item.find('.category-item-price').text()
            return {
                title: item.find('.category-item-name').text(),
                link: item.find('a').first().attr('href'),
                image: image,
                description: `<div>
                                <img src=${image}>
                                Price: ${price}<br>
                              </div>`
            }
        })

    const title = $('.pc-breadcrumb .breadcrumb-list li').map((_, item) => $(item).text().trim()).get().join(' > ')
    return {
        title: title,
        link: url,
        item: items,
    };
}
