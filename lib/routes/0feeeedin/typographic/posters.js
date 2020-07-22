const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://feeds.feedburner.com/tgposters-thefeed`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('entry').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title1 = $('title').text();
            const title2 = title1.replace('<![CDATA[', '');
            const title = title2.replace(']]>', '');
            const time = $('updated').text();
            const itemUrl = $('id').text();
            const content = $('content').text();
            // const author = $('author').text();
            const single = {
                title,
                description: content,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'typo/graphic 平面海报设计',
        link: 'https://www.typographicposters.com/?filter=recent',
        item: out,
    };
};
