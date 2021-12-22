const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://uncrate.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.article-title a').text();
            const category = $('.category').text();
            const itemUrl = $('.article-title a').attr('href');
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
        const imageUrl = `<img src="` + $('.swiper-slide a img').first().attr('data-retina') + `"/>`;
        const content = $('.copy-wrapper').html();
        out[indexList[i]].description = imageUrl + content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'uncrate 高端消费指南',
        link: 'https://uncrate.com/cn/',
        item: out,
    };
};
