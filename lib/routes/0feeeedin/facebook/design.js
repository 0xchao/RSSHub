const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://facebook.design/feed.xml`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('item').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const pubDate = $('pubDate').text();
            const title = $('title').text();
            const description1 = $.html('description').toString();

            const description2 = description1.replace('<!', '');
            const description3 = description2.replace('<description>--[CDATA[', '');
            const description4 = description3.replace('--', '');
            const description = description4.replace(']]&gt;</description>', '');
            const itemUrl = 'https://facebook.design' + $('link').text();
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
        title: 'FACEBOOK DESIGN 官方博客',
        link: 'https://facebook.design/',
        item: out,
    };
};
