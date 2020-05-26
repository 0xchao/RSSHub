const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.booooooom.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.content-grid article.grid-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.sub-item__title').text();
            const times = $('.single-post-header__date').text();
            const day = times.slice(0, 2);
            const month = times.slice(3, 5);
            const year = `20` + times.slice(6, 8);
            const time = year + `.` + month + `.` + day;
            const itemUrl = $('.grid-item__link').attr('href');
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
        const imageUrl = `<img src="` + $('.single-post__feature-img img').attr('src') + `"/>`;
        const content = $('.post-content').html();
        out[indexList[i]].description = imageUrl + content;
        const category = $('.single-post-header__categories').text();
        out[indexList[i]].category = category;
        const author = $('.single-post-header__author').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'BOOOOOOOM 当代艺术平台',
        link: 'https://www.booooooom.com/',
        item: out,
    };
};
