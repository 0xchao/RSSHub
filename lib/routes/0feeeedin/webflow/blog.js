const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://webflow.com/blog-pages/new`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.b-hp-row__list-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.b-post__hero-detail-text').text();
            const title = $('.b-thing__title').text();
            const category = $('.b-thing__topic').text();
            const imageUrl = `<img src="` + $('.b-post-thumb__image img').attr('src') + `">`;
            const itemUrl = 'https://www.webflow.com' + $('.b-post-thumb__image').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                imageUrl,
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
        const content = $('.b-read').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + '<br/>' + content;
        const author = $('.b-post__details-wrap-cell .b-post__hero-detail-text').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Webflow Blog',
        link: 'https://webflow.com/blog-pages/new',
        item: out,
    };
};
