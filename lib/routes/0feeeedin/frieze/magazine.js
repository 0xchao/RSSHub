const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://frieze.com/editorial`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.view-editorial .view-content .views-row').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.field-name-article-category-date .field-items .field-item h4').text();
            const category = $('.field-name-article-category-date .field-items .field-item h4 a').text();
            const title = $('.field-name-title-field a').text();
            const imageUrl = $('.field-name-field-thumbnail .field-items .field-item a').html();
            const description = imageUrl + `<br /><h2>` + title + `</h2><br />` + $('.field-name-field-intro .field-items .field-item').html();
            const itemUrl = 'https://frieze.com' + $('a').attr('href');
            const single = {
                title,
                category,
                description,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `Frieze 当代艺术文化杂志`,
        link: `https://frieze.com/`,
        item: out,
    };
};
