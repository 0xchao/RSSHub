const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.abstract.com/blog-all-articles`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.col-6-t.col-12-mp.w-dyn-item').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            // const time = $('.date').text();
            const title = $('h2').text();
            // const category = $('.cat').text();
            const imageUrl = `<img src="` + $('.img-cover').attr('src') + `">`;
            const description = imageUrl + `<br/><p>` + $('.mb-small').text() + `</p>`;
            const itemUrl = $('.blog-post-link').attr('href');
            const single = {
                title,
                // category,
                description,
                // pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `abstract 知名设计团队博客`,
        link: `https://www.abstract.com/`,
        item: out,
    };
};
