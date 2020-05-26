const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.figma.com/blog/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.css-k0hnjq .css-1skjcwr').get();
    const firstblog = $('.css-eg6erc .css-vhva4n').get();
    list.unshift(firstblog);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.css-0 time').attr('datetime');
            const title = $('.css-a04oy7').text();
            const itemUrl = 'https://www.figma.com' + $('a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
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
        const title = $('.css-1k14ngr').text();
        out[indexList[i]].title = title;
        const imageUrl = $('.css-tuh7x8 noscript').html();
        const imgg = cheerio.load(imageUrl);
        const imggg = `<img src="` + imgg('picture img').attr('src') + `">`;
        const content = $('div.css-1aecauc').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = imggg + '<br/>' + contentStr;
        // let category = $('div.blog-content h2:first-child').text();
        // out[indexList[i]].category = category;
        const author = $('.author--info').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Figma Blog',
        link: 'https://www.figma.com/blog/',
        item: out,
    };
};
