const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://arting365.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.index4_1 ul li').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('h4').text();
            const title = $('h3 a').text();
            const category = $('h6').text();
            const linkzh = $('h3 a').attr('href');
            const itemUrl = encodeURI(linkzh);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                category,
                pubDate: new Date(time).toUTCString(),
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

        const content = $('.focuspoint').html() + $('.pd_left .pd_zw').html();
        const contentStr1 = content.replace('<hr>', '');

        out[indexList[i]].description = contentStr1;

        const author = $('.banner3_dn span:nth-child(2)').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: `ARTING365 创意设计门户`,
        link: `http://arting365.com/`,
        item: out,
    };
};
