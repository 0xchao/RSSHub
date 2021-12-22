const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://cdc.tencent.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.item-title h3').text();
            const imageUrl = $('.item-banner a').html();
            const itemUrl = $('.item-banner a').attr('href');
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

        const time = $('.avatar + p').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.content-text').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const author = $('.avatar + p span').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
