const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://airbnb.design/articles/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.list-post').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            // const pubDate = $('pubDate').text();
            const title = $('.card h2').text();
            const category = $('.meta a').first().text();
            const itemUrl = $('.card .h-link').attr('href');
            const imageUrl1 = $('.cover-image').attr('style');
            const imageUrl2 = imageUrl1.replace('background-image: url(', '');
            const imageUrl = `<img src="` + imageUrl2.replace(');', '') + `"/>`;
            const description = imageUrl + $('.card h3').text();

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                description,
                category,
                // pubDate,
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `Airbnb Design官方博客`,
        link: `https://airbnb.design/`,
        item: out,
    };
};
