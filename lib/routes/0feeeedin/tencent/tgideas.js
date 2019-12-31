const cheerio = require('cheerio');
const got = require('@/utils/got');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const url = `https://tgideas.qq.com/list.html`;

    const res = await got.get(url, {
        responseType: 'buffer',
    });
    const data = iconv.decode(res.data, 'gb2312');
    const $ = cheerio.load(data);
    const list = $('.lis-content .content-it').get();
    list.shift();

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let title = $('.tit-content-article').text();
            let author = $('.content-author').text();
            const description = $('.content-img').html() + '<br/>' + title;
            const itemUrl = 'https://tgideas.qq.com' + $('.content-ln').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                author,
                description,
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'TGideas 腾讯互娱设计团队',
        link: 'https://tgideas.qq.com/',
        item: out,
    };
};
