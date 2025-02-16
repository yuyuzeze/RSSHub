import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/category/:category',
    categories: ['shopping'],
    example: '/collections/new?sort_by=created-descending',
    name: 'カテゴリー',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const queryParams = ctx.req.query();
    const category = ctx.req.param('category');
    let url = `https://okaimono-snoopy.jp/collections/${category}`;

    // 将所有查询参数添加到URL
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    const response = await got({
        method: 'get',
        url,
    });
    // 提取页面中嵌入的 meta 变量
    const metaMatch = response.data.match(/var\s+meta\s*=\s*({[\s\S]*?});/);
    let metaData = {};
    if (metaMatch) {
        metaData = JSON.parse(metaMatch[1]);
    }

    const items = metaData.products?.map((product) => {
        const variant = product.variants[0]; // 获取第一个变体
        return {
            title: variant.name,
            link: `https://okaimono-snoopy.jp/products/${variant.sku}`,
            description: `
                <div>
                    <p>価格: ¥${(variant.price / 100).toLocaleString()}</p>
                    <p>カテゴリー: ${product.type}</p>
                    <img src="https://okaimono-snoopy.jp/cdn/shop/files/${variant.sku}.jpg" />
                </div>
            `,
        };
    }) || [];

    return {
        title: 'Snoopy 公式店',
        link: url,
        item: items,
    };
}
