import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/category/:category/:subcategory?',
    categories: ['shopping'],
    example: '/information_cat/news',
    name: 'カテゴリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const { category, subcategory = '' } = ctx.req.param();
    let url = `https://togojinja.or.jp/${category}`;
    if (subcategory) {
        url += `/${subcategory}`;
    }

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const list = $('a.post')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('[data-test="item-name"]');
            return {
                title: item.find('.post__ttl').text().trim(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = `${$('.inner.typesquare_tags').html()}`;
                return item;
            })
        )
    );

    return {
        title: '東郷神社',
        link: url,
        item: items,
    };
}
