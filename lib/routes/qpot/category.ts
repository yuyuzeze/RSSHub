import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/category/:cate1/:cate2?/:cate3?',
    categories: ['shopping'],
    example: '/c/gr81/gr2/gr7?page=1&sort=latest',
    name: 'カテゴリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const { cate1, cate2 = '', cate3 = '' } = ctx.params;
    let url = `https://shop.q-pot.jp/c/${cate1}`;
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

    const list = $('.fs-c-productListItem')
        .toArray()
        .map((item) => {
            item = $(item)
            return {
                title: item.find('.fs-c-productName__name').text(),
                link: `https://shop.q-pot.jp${item.find('.fs-c-productListItem__imageContainer a').attr('href')}`,
                category: item.find('.list_itemcat').text(),
                price: item.find('.fs-c-price__value').text(),
                image: item.find('.fs-c-productListItem__imageContainer img').data('layzr')
            }
        })

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `<div>${item.category}<br>
                                    Price: ¥${item.price}
                                    <img src="${item.image}">
                                    ${$('#item_detail_text').html()}</div>`;
                return item;
            })
        )
    );

    return {
        title: 'QPOT - 新着商品',
        link: url,
        item: items,
    };
}
