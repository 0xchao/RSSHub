const cheerio = require('cheerio');
const got = require('@/utils/got');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const url = `https://www.uisdc.com/archives`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.list-item-default').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.time').text();
            const pubDate = formatPubDate(time);
            const title = $('.title').text();
            const author = $('.author').text();
            const category = $('.tags a').first().text();
            const imageUrl1 = $('.thumb').attr('style');
            const imageUrl2 = imageUrl1.replace('background-image:url(', '');
            const imageUrl = `<img src="` + imageUrl2.replace(')', '') + `"/>`;
            const description = imageUrl + $('.item-content a p').text();
            const itemUrl = $('.a_block').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                description,
                author,
                category,
                pubDate,
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'UISDC 优设网',
        link: 'https://www.uisdc.com/',
        item: out,
    };
};
