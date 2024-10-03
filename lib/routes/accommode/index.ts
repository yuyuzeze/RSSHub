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
        subCategory: '子分类，选填项，目的是为了兼容老逻辑'
    },
    name: '新作, バッグ, ファッション, 雑貨, モバイル, アクセサリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const subCategory = ctx.req.param('subCategory');
    const sort = ctx.req.param('sort');

    let url = `https://accommode.com/c/${category}`;
    if (subCategory) {
        url += `/${subCategory}`;
    }
    if (sort) {
        url += `?sort=${sort}`;
    }

    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = load(response.data);

    const list = $('div.groupLayout div.gl_Item')
        .toArray()
        .map((item) => {
            item = $(item)
            const title = item.find('h2.itemGroup a').html();
            return {
                title: title.split('<br>')[1],
                link: item.find('div.FS2_thumbnail_container.FS2_additional_image_detail_container a').attr('href'),
                image: item.find('div.FS2_thumbnail_container.FS2_additional_image_detail_container a img').attr('src'),
                category: title.split('<br>')[0],
                price: item.find('span.itemPrice').text(),
                description: item.find('div.itemGroup_description').text(),
                pubDate: parseDate(new Date().toISOString().split('T')[0]),
            }
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.fs-p-productDescription').html();
                return item;
            })
        )
    );

    return {
        title: `ACCOMMODE - ${$('div.fs-c-breadcrumb__listItem a').text().join(' > ')}`,
        link: url,
        item: items,
    };
}
