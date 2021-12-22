const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.gooood.cn/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.post-item').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.post-date').text();
            const title = $('.entry-title').text();
            const imageUrl = `<img src="` + $('.post-thumbnail picture source').attr('srcset') + `">`;
            const description = imageUrl + `<br/><p>` + $('.cover-link').text() + `</p>`;
            const itemUrl = `https://gooood.cn` + $('.cover-link').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                description,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'gooood 谷德设计网',
        link: 'https://www.gooood.cn/',
        item: out,
    };
};
