import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/category/:category',
    categories: ['shopping'],
    example: '/category/l_accessories_ch?commercialType=0|2|3&currentPage=1&alignmentSequence=news_from_date+desc',
    name: '商品一覧',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const category = ctx.req.param('category');
    let url = `https://samanthathavasa.jp/category/${category}`;

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

    const list = $('#catalog_list > li.catalogList_item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.commodityName').text(),
                link: 'https://samanthathavasa.jp' + item.find('.ga4_event_select_item').attr('href'),
                image: item.find('.wrap-product-image .product-image img').data('src'),
                category: item.find('.brandName').text(),
                price: item.find('.regular_price').text(),
                pubDate: parseDate(new Date().toISOString().split('T')[0]),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `￥${item.price}(税込)<br><img src="${item.image}" /><br>${$('.product_text').html()}`;
                return item;
            })
        )
    );

    return {
        title: `Samantha Global - ${category}`,
        link: url,
        item: items,
    };
}
