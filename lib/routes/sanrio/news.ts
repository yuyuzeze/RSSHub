import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/news/:category',
    categories: ['shopping'],
    example: '/goods/?categories=34&pg=1',
    name: 'Goods',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const category = ctx.req.param('category');
    let url = 'https://www.sanrio.co.jp/wp-json/wp/v2/news';

    // 将所有查询参数添加到URL
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
        url += `?${queryString}&boss_category=${category}`;
    }

    const { data } = await got({
        method: 'get',
        url,
    });

    const items = data.map((item) => {
        const categories = item.category.map((c) => c.name);

        return {
            title: item.title.rendered,
            link: item.link,
            category: categories,
            image: item.thumbnail.url,
            description: `<div><img src="${item.thumbnail.url}" /></div>`,
        };
    });

    return {
        title: 'Sanrio - News',
        link: url,
        item: items,
    };
}
