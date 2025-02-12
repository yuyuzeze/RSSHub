import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/newarrival',
    categories: ['shopping'],
    example: '/shop/e/est-new',
    name: 'NEW ARRIVAL',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    let url = 'https://www.samantha.co.jp/shop/e/est-new';

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

    const list = $('ul.block-cart-i--items dl.block-cart-i--goods')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('dt a').attr('title'),
                link: 'https://www.samantha.co.jp' + item.find('dt a').attr('href'),
                image: item.find('dt a img').data('srcset'),
                category: item.find('.block-cart-i--brand-name').text(),
                price: item.find('.block-cart-i--price').text(),
                pubDate: parseDate(new Date().toISOString().split('T')[0]),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `${item.price}<br><img src="${item.image}" /><br>${$('.block-goods-comment1').html()}`;
                return item;
            })
        )
    );

    return {
        title: 'Samantha Thavasa - 新着商品',
        link: url,
        item: items,
    };
}
