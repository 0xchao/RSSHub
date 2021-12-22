const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.awwwards.com/blog/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('ul.list-items li.js-collectable').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('.box-info .content .row h3 a').text();
            const itemUrl = 'https://www.awwwards.com' + $('.rollover a').attr('href');
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

        const time = $('span[itemprop="datePublished"]').attr('content');
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const title = $('h1[itemprop="headline name"]').text();
        out[indexList[i]].title = title;
        const content = $('div[itemprop="articleBody"]').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        const category = $('span[itemprop="about"]').text();
        out[indexList[i]].category = category;
        const author = $('span[itemprop="name author"]').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Blog - Awwwards',
        link: 'https://www.awwwards.com/blog/',
        item: out,
    };
};
