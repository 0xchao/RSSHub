const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.itsnicethat.com/features`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.mxn4 .col').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let title = $('.listing-item-title').text();
            const time = $('.link-reset .mt3').text();
            const imageUrl = $('.listing-item-image .pixelated')
                .attr('src')
                .substring(96);
            const description = `<img src="https://media.itsnicethat.com/original_images/` + imageUrl + `"/><br/>` + $('.no-truncate').text();
            const itemUrl = `https://www.itsnicethat.com` + $('.link-reset').attr('href');

            const single = {
                title,
                description,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `It's Nice That 创意灵感`,
        link: `https://www.itsnicethat.com/`,
        item: out,
    };
};
