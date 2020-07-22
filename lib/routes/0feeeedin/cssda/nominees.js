const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.cssdesignawards.com/wotd-award-nominees`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.single-project').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.sp__meta__date').text() + ` 2019`;
            let title = $('.specific-title').text();
            if (!title) {
                title = $('a').text();
            }
            const itemUrl = 'https://www.cssdesignawards.com/sites' + $('h3.single-project__title a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
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

        // let time = $('single-website__date').text();
        // out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.single-website__thumbnail__wrapper').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        const category = $('.single-website__desc__meta').html();
        out[indexList[i]].category = category;
        const author = $('.single-website__author').html();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'NOMINEES - CSSDesignAwards',
        link: 'https://www.cssdesignawards.com/wotd-award-nominees',
        item: out,
    };
};
