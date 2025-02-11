import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search',
    categories: ['shopping'],
    example: '/plaza/search.aspx?ttl=All%20%E6%96%B0%E5%95%86%E5%93%81&s=seq,-s_dt&genre=all',
    name: '商品一覧',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    let url = 'https://plazastyle.search.zetacx.net/api/item';

    // 将所有查询参数添加到URL
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
        url += `?${queryString}`;
        url += `&_=${Date.now()}`;
    }

    const { data } = await got({
        method: 'get',
        url,
    });

    const items = data.result.items.map((item) => ({
        title: item.name,
        link: `https://www.plazastyle.com/shop/g/g${item.goods}`,
        image: `https://www.plazastyle.com/img/goods/S/${item.src_s}`,
        description: `
            <div>
                <img src="https://www.plazastyle.com/img/goods/L/${item.image_url}" />
                <p>価格: ￥${item.price}</p>
                <p>ブランド: ${item.rits_brand_name || ''}</p>
                ${item.new ? '<p>新商品</p>' : ''}
                ${item.sale ? '<p>セール中</p>' : ''}
            </div>
        `,
        category: item.category,
        pubDate: parseDate(item.release_dt),
    }));

    return {
        title: `PLAZA - ${data.meta.request_params.q || '全品类'}`,
        link: url,
        item: items,
    };
}
