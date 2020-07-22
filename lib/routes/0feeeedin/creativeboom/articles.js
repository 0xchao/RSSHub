const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.creativeboom.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.articles--home .article--vertical').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.article__title--full').text();
            const times = $('.article__date a').text();
            const day = times.slice(0, 2);
            const month = times.slice(3, 5);
            const year = times.slice(6, 10);
            const time = year + `.` + month + `.` + day;
            const category = $('.article__categories li').first().text();
            const itemUrl = `https://creativeboom.com` + $('.article__link').attr('href');
            const imageUrl = `<img src="` + $('.article__image').attr('src') + `"/>`;
            const single = {
                title,
                imageUrl,
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
        const content = $('.post__body').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const author = $('.post__author-link').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'CREATIVEBOOM 创意灵感设计社区',
        link: 'https://www.creativeboom.com/',
        item: out,
    };
};
