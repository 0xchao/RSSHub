const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://informationisbeautiful.net/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.iib-grid--layout_b .iib-grid-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.iib-thumb-heading').text();
            const itemUrl = $('a').attr('href');
            const imageUrl = `<img src="` + $('.iib-grid-bg').attr('data-bg') + `"/>`;
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
        const time = $('.iib-blog-article-date').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        let content = $('.iib-blog-article-text').html();
        if (!content) {
            content = $('.iib-viz-section .iib-w .iib-center-content').html();
        }
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const category = $('.intro-pretitle').text();
        out[indexList[i]].category = category;
        const author = $('.intro-author').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '最美信息 Information is Beautiful',
        link: 'https://informationisbeautiful.net/',
        item: out,
    };
};
