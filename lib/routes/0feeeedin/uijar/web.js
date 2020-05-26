const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://uijar.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.pa4.postimg').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('h4 a').text();
            const itemUrl = 'https://uijar.com/' + $('h4 a').attr('href');
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

        // let time = $('.box-breadcrumb .box-left .text-x-thin').text();
        // out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.w-70-l.center').html() + `<br/>` + $('.post-sidebar h2').html() + `<br/>` + $('.post-sidebar a').attr('href');
        // const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = content;
        // let category = $('.list-tags').html();
        // out[indexList[i]].category = category;
        // let author = $('.box-info .by a').html();
        // out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'UIJar | Handpicked design inspiration for your real life projects',
        link: 'https://uijar.com/',
        item: out,
    };
};
