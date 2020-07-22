const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://tubikstudio.com/all-posts/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.custom-article-block .container .row .col-lg-12').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.date').text();
            const title = $('h3').text();
            const category = $('.cat').text();
            const imageUrl = `<img src="` + $('.attachment-large').attr('src') + `">`;
            const description = imageUrl + `<br/><p>` + $('.excerpt').text() + `</p>`;
            const itemUrl = $('a').attr('href');
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
        title: `tubik 知名设计团队博客`,
        link: `https://tubikstudio.com/`,
        item: out,
    };
};
