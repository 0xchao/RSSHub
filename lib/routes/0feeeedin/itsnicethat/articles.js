const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.itsnicethat.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.index__list .index__item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let title = $('.index__item__title span').text();
            const time = $('time').attr('datetime');
            const imageUrl = `<img src="` + $('.index__item__image img').attr('data-src') + `"/>`;
            const description = imageUrl + `<br/>` + $('.no-truncate').text();
            const itemUrl = `https://www.itsnicethat.com` + $('.index__item__title').attr('href');
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
        title: `It's Nice That 创意灵感`,
        link: `https://www.itsnicethat.com/`,
        item: out,
    };
};
