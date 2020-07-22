const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://sgustokdesign.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.block-articles-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            // const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('.articles-info .name').text();
            const itemUrl = $('.box-img a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(got.get(itemUrl));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await got.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const $ = cheerio.load(res.data);
        const content = $('.block-articles-post').html();
        out[indexList[i]].description = content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Sgustok Design 当代设计',
        link: 'https://sgustokdesign.com/',
        item: out,
    };
};
