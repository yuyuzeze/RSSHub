import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/category/:category',
    categories: ['shopping'],
    example: '/collections/top-new?sort_by=created-descending',
    name: 'カテゴリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const category = ctx.req.param('category');
    let url = `https://jumpshop-online.com/collections/${category}`;

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

    const items = $('.card-wrapper')
        .toArray()
        .map((ele) => {
            const item = $(ele)
            const isNew = item.find('.card__badge span').text()
            return {
                title: item.find('.card-information__text').text(),
                link: `https://jumpshop-online.com${item.find('.full-unstyled-link').attr('href')}`,
                description: `<div>
                                <img src="${item.find('.motion-reduce').attr('src')}">
                                Price: ${item.find('.price-item--regular').text()}<br>
                                ${isNew ? `<div style="width:200px;height:20px;background:rgb(18, 18, 18);color:#fff">
                                    ${isNew}
                                </div>`: ''}
                            </div>`
            }
        })

    return {
        title: 'Jump Shop Online',
        link: url,
        item: items,
    };
}
