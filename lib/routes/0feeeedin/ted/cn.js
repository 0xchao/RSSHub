const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.ted.com/talks?sort=newest&language=zh-cn`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list1 = $('#browse-results .row .col').get();
    const list = list1.slice(0, 20);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.media__message h4.h9 a').text();
            const itemUrl = `https://ted.com` + $('.media__message h4.h9 a').attr('href');
            const imageUrlSrc = `<img src="` + $('.thumb__image').attr('src') + `"/>`;
            const imageUrl = imageUrlSrc.replace('?quality=89&w=320', '');

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
        const time = $('meta[itemprop=uploadDate]').attr('content');
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const content = $('meta[itemprop=description]').attr('content');
        out[indexList[i]].description = out[indexList[i]].imageUrl + '<br/>' + content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'TED 中文',
        link: 'https://www.ted.com/talks?sort=newest&language=zh-cn',
        item: out,
    };
};
