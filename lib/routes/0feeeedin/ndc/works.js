const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.ndc.co.jp/works/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.worksCard').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('div a').attr('title');
            const imageUrl = $('.worksCard_image').html();
            const itemUrl = 'https://www.ndc.co.jp' + $('div a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                imageUrl,
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
        const content = $('.worksDetailV2Body').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const category = $('.worksDetailV2Body_category').text();
        out[indexList[i]].category = category;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'NDC 日本设计中心 原研哉',
        link: 'https://www.ndc.co.jp/works/',
        item: out,
    };
};
