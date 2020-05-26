const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://abduzeedo.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('article.post-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('h4.title a').text();
            const itemUrl = 'http://abduzeedo.com' + $('h4.title a').attr('href');
            const category = $('.tags').text();
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                category,
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

        const time = $('.node__submitted p:nth-child(2)').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const title = $('h1.page-title').text();
        out[indexList[i]].title = title;
        const content = $('div.blog-content').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        // let category = $('div.blog-content h2:first-child').text();
        // out[indexList[i]].category = category;
        const author = $('.written-by article h5 a').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'ABDUZEEDO',
        link: 'https://abduzeedo.com/',
        item: out,
    };
};
