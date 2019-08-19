const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://isux.tencent.com/articles/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article-single').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.date').text();
            let title = $('.specific-title').text();
            if (!title) {
                title = $('a').text();
            }
            const itemUrl = 'https://isux.tencent.com/' + $('.article-single').attr('href');
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

        let time = $('_article_date span.date').text();
        // if (!time) {
        //     time = $('.article-header .info .date').text();
        // }
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.editable ._mod_content').html();
        out[indexList[i]].description = content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
