const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://thetype.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('#content').first().find('.hentry').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.entry-date abbr').attr('title');
            const title = $('.entry-title a').text();
            const description = $('.entry-content').html();
            const author = $('.entry-meta .author').text();
            const itemUrl = $('.entry-title a').attr('href');
            const single = {
                title,
                description,
                author,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `The Type 中文排版研究`,
        link: `https://thetype.com/`,
        item: out,
    };
};
