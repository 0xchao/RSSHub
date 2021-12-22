const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.cssdesignawards.com/blog`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.blog-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.date').text();
            let title = $('.blog-item__title').text();
            if (!title) {
                title = $('a').text();
            }
            const itemUrl = 'https://www.cssdesignawards.com' + $('.blog-item__thumb-link').attr('href');
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

        const time = $('.blog-post__meta .date').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.blog-post__entry').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        const category = $('.blog-post__meta .category').html();
        out[indexList[i]].category = category;
        const author = $('.blog-post__meta .author').html();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'BLOG - CSSDesignAwards',
        link: 'https://www.cssdesignawards.com/blog',
        item: out,
    };
};
