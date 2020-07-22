const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://eyeondesign.aiga.org/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.grid-items .grid-post').get();
    list.splice(1, 1);
    list.pop();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.grid-item-title a').text();
            const category = $('.grid-item-label a').text();
            const description = $('.grid-item-lede a p').text();
            const itemUrl = $('.grid-item-title a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title,
                category,
                description,
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `AIGA设计协会 | Eye on Design`,
        link: `https://eyeondesign.aiga.org/`,
        item: out,
    };
};
