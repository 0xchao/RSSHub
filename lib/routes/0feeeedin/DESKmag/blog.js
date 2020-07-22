const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://vanschneider.com/blog`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.layout--recent-post').get();
    const firstblog = $('.layout--featured-post').get();
    list.unshift(firstblog);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.article-link h2').text();
            const imageUrl = `<img src="` + $('.img-placeholder img').attr('data-src') + `">`;
            const itemUrl = $('.article-link').attr('href');
            const authorby = $('.article-link span.pt').text();
            const author = authorby.replace('by ', '');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                imageUrl,
                author,
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
        const timetext = $('.article-date').text();
        const time = timetext.replace('Article posted on ', '');
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const content = $('.wysiwyg').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + '<br/>' + content;
        const author = $('.b-post__details-wrap-cell .b-post__hero-detail-text').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'The DESK Magazine 设计杂志',
        link: 'https://vanschneider.com/blog',
        item: out,
    };
};
