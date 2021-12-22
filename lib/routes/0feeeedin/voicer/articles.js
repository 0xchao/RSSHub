const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://www.voicer.me/feed`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('pubDate').text();
            const title = $('title').text();
            const itemUrl = $('guid').text();
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
        const imageUrl = `<img src="` + $('.lazyBG img').attr('src') + `"/>`;
        const content = $('.panel-layout').html();
        out[indexList[i]].description = imageUrl + content;
        const author = $('.entry-subtitle').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'VOICER 生活设计美学',
        link: 'http://www.voicer.me/',
        item: out,
    };
};
