import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/search',
    categories: ['shopping'],
    example: 'https://stripe-club.com/search?so=NEW&pl=100&pu=10000',
    name: '商品一覧',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    let url = 'https://stripe-club.com/search';

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

    const list = $('ul[data-js="item-product-list"] > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('[data-test="item-name"]');
            return {
                title: title.text(),
                link: title.parent().attr('href'),
                image: item.find('[data-test="item-image"]').data('src'),
                category: title.find('[data-test="item-display-brand-name"]').text(),
                price: item.find('[data-test="item-max-sales-price"]').text(),
                pubDate: parseDate(new Date().toISOString().split('T')[0]),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `￥${item.price}(税込)<br><img src="${item.image}" /><br>${$('[data-tab-contents="tab-item-detail-info"] [data-design-block-name="通常本文M"]').html()}`;
                return item;
            })
        )
    );

    return {
        title: `STRIPE CLUB - ${$('.dblc-normal-heading-1').text()}`,
        link: url,
        item: items,
    };
}
