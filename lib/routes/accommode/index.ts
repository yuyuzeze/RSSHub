import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:category/:subCategory?/:sort?',
    categories: ['shopping'],
    example: 'https://accommode.com/c/goods/goods_pouch?sort=latest',
    parameters: {
        category: '分类，必填项',
        subCategory: '子分类，选填项，目的是为了兼容老逻辑',
    },
    name: '新作, バッグ, ファッション, 雑貨, モバイル, アクセサリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const subCategory = ctx.req.param('subCategory');
    const sort = ctx.req.query('sort');

    let url = `https://accommode.com/c/${category}`;
    if (subCategory) {
        url += `/${subCategory}`;
    }
    if (sort) {
        url += `?sort=${sort}`;
    }

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const list = $('div.fs-c-productList__list article.fs-c-productList__list__item')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h2.fs-c-productListItem__productName a');
            return {
                title: title.find('span').html().split('<br>')[1],
                link: `https://accommode.com${title.attr('href')}`,
                image: item.find('div.fs-c-productListItem__image a img').data('layzr'),
                category: title.find('span').html().split('<br>')[0],
                price: item.find('div.fs-c-productListItem__prices > .fs-c-productPrice--selling .fs-c-price__value').text(),
                pubDate: parseDate(new Date().toISOString().split('T')[0]),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `${item.price}(税込)<br><img src="${item.image}" /><br>${$('.fs-p-productDescription').html()}`;
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
