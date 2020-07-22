const cheerio = require('cheerio');
const got = require('@/utils/got');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const url = `https://ueno.co/news`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('._263920B2HS').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('._1ydHMRCoQp').text();
            const pubDate = formatPubDate(time);
            const title = $('._14m2EFScx9').text();
            const description = $('._2hUgB5_JlG').text();
            const itemUrl = `https://ueno.co` + $('._1wFOAHlQcN').attr('href');
            const single = {
                title,
                description,
                pubDate,
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'ueno. News',
        link: 'https://ueno.co/news',
        item: out,
    };
};
