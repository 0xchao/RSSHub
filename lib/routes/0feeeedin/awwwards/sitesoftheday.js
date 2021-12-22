const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.awwwards.com/websites/sites_of_the_day/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('ul.list-items li.js-collectable').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('.box-info .content .row h3').text();
            const itemUrl = 'https://www.awwwards.com' + $('.rollover a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
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

        const time = $('.box-breadcrumb .box-left .text-x-thin').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.box-page-info h3').html() + $('.box-page-gallery').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        const category = $('.list-tags').html();
        out[indexList[i]].category = category;
        const author = $('.box-info .by a').html();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Sites of the day - Awwwards',
        link: 'https://www.awwwards.com/websites/sites_of_the_day/',
        item: out,
    };
};
