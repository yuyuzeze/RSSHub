import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['shopping'],
    example: '/event/search?word=JUMPショップ',
    name: 'search',
    maintainers: ['yuyuzeze'],
    description: ``,
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    let url = `https://t.livepocket.jp/event/search?word=${keyword}`;

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('.item')
        .toArray()
        .map((ele) => {
            const item = $(ele)
            return {
                title: item.find('.title-inner').text(),
                link: item.find('a').first().attr('href'),
                status: item.find('.status-view').text(),
                description: item.find('.info').html(),
                image: item.find('.thumb-vertical').attr('src')
            }
        })

    return {
        title: `livepocket - ${keyword}`,
        link: url,
        item: items,
    };
}
