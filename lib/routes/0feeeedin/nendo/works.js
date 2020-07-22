const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.nendo.jp/en/release/2019/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.eworks').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.entry-title a').text();
            const imageUrl = $('.entry-header a').html();
            const itemUrl = $('.entry-title a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                imageUrl,
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
        const time = $('.entry-header ul li').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const content = $('.entry-content').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const category = $('.worksDetailV2Body_category').text();
        out[indexList[i]].category = category;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'nendo 佐藤大',
        link: 'http://www.nendo.jp/en/release/2019/',
        item: out,
    };
};
