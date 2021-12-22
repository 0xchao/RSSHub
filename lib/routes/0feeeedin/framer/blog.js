const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.framer.com/blog/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.style__Card-sc-1fp4p71-0').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.Type__H4-sc-1acg4t3-3').text();
            const itemUrl = 'https://framer.com' + $('a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
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
        const time = $('.cOuoXI').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const imageUrl = `<img src="` + $('picture img').attr('src') + `">`;
        const content = $('.dropcap').html();
        out[indexList[i]].description = imageUrl + '<br/>' + content;
        // let category = $('div.blog-content h2:first-child').text();
        // out[indexList[i]].category = category;
        const author = $('.lbOURi').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Framer Blog',
        link: 'https://www.framer.com/blog/',
        item: out,
    };
};
