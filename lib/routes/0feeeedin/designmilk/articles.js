const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://design-milk.com/latest/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article-list-item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let title = $('.article-content h3 a').text();
            const imageUrl = `<img src="` + $('.article-image img').attr('src') + `"/>`;
            const description = imageUrl + $('.article-image img').text('.article-content p');
            const itemUrl = $('.article-image').attr('href');
            const single = {
                title,
                description,
                link: itemUrl,
                guid: itemUrl,
            };
            // proList.push(got.get(itemUrl));
            // indexList.push(i);
            return Promise.resolve(single);
        })
    );
    // const responses = await got.all(proList);
    // for (let i = 0; i < responses.length; i++) {
    //     const res = responses[i];
    //     const $ = cheerio.load(res.data);
    //     let time = $('.blog-entry__footer__meta .body-text p span')
    //         .first()
    //         .text();
    //     out[indexList[i]].pubDate = new Date(time).toUTCString();
    //     const content = $('.blog-entry__content').html();
    //     out[indexList[i]].description = out[indexList[i]].imageUrl + content;
    //     ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    // }
    ctx.state.data = {
        title: 'design/milk 生活设计美学',
        link: 'https://design-milk.com/',
        item: out,
    };
};
