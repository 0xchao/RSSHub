const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://hoverstat.es/archive`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.grid-list .tile').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.tile__description').text();
            const title = $('.tile__title').text();
            const author = $('.tile__subtitle').text();
            const itemUrl = 'https://hoverstat.es' + $('a:first-child').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                author,
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

        const content = $('.feature__hero .feature__video .feature__frame').html() + $('.section-title').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        const category = $('.website__tags').html();
        out[indexList[i]].category = category;
        // const author = $('.box-info .by a').html();
        // out[indexList[i]].author = author;
        // ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'HOVER STATES',
        link: 'https://hoverstat.es/archive',
        item: out,
    };
};
