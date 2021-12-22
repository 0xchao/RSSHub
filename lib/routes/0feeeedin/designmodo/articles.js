const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://designmodo.com/articles/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('article.article').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.meta span').attr('content');
            const title = $('.article-preview h1').text();
            const category = $('.post_tag').text();
            const imageUrl = `<img src="` + $('.wp-post-image').attr('data-src') + `">`;
            const description = imageUrl + '<br/><p>' + $('.img-container + p').html() + '</p>';
            const itemUrl = $('.section-link').attr('href');
            const author = $('.meta a[rel=author]').text();
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                description,
                category,
                author,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Designmodo 全球设计资讯',
        link: 'https://designmodo.com/',
        item: out,
    };
};
