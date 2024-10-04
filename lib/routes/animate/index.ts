import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:category/:page?',
    categories: ['shopping'],
    example: 'https://www.animate-onlineshop.jp/products/list.php?mode=search&smt=%E5%91%AA%E8%A1%93%E5%BB%BB%E6%88%A6',
    parameters: {
        category: '分类，必填项',
        page: 'php页面，选填项',
    },
    name: 'animate',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const page = ctx.req.param('page');
    const queryString = ctx.req.queryString;

    let url = `https://www.animate-onlineshop.jp/${category}`;
    if (page) {
        url += `/${page}`;
    }
    if (queryString) {
        url += `?${queryString}`;
    }

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const list = $('div.item_list > ul > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h3 > a');
            return {
                title: title.attr('title'),
                link: `https://www.animate-onlineshop.jp${title.attr('href')}`,
                image: item.find('div.item_list_thumb > a > img').attr('src'),
                category: title.find('div.item_list_detail div.item_list_status .media').text(),
                price: item.find('div.item_list_detail p.price:first-child').text(),
                saleDate: item.find('div.item_list_detail div.item_list_status .release').text(),
                status: item.find('div.item_list_detail div.item_list_status .stock').text(),
                pubDate: parseDate(new Date().toISOString().split('T')[0]),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `<img src="${item.image}" /><br>
                                    <h3>${item.title}</h3><br>
                                    <p>${item.price}</p>
                                    ${item.status}<br>
                                    ${item.category}<br>
                                    ${item.saleDate}`;
                return item;
            })
        )
    );

    return {
        title: `ACCOMMODE - ${$('nav.fs-c-breadcrumb')
            .first()
            .find('.fs-c-breadcrumb__listItem')
            .slice(1)
            .map((_, el) => $(el).text())
            .get()
            .join(' > ')}`,
        link: url,
        item: items,
    };
}
