const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.adstyle.com.cn/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.md-waterfall li').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.block-text h2 a').text();
            const category = $('.channel_name').text();
            const itemUrl = $('.block-text h2 a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                category,
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

        const time = $('#create_date').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const content = $('.article .block .view').html();
        out[indexList[i]].description = content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '安邸AD家居生活',
        link: 'http://www.adstyle.com.cn/',
        item: out,
    };
};
