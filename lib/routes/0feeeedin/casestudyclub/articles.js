const cheerio = require('cheerio');
const got = require('@/utils/got');
// const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const url = `https://www.casestudy.club/case-studies`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.item-case-study').get();

    // const proList = [];
    // const indexList = [];

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.title-case-study').text();
            const category = $('.category').text();
            // const imageUrl = `<img src="` + $('.image-3').attr('src') + `"/>`;
            const description = title;
            const itemUrl = $('.top-wrapper a').eq(1).attr('href');
            const single = {
                title,
                description,
                category,
                link: itemUrl,
                guid: itemUrl,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'CaseStudyClub 案例学习俱乐部',
        link: 'https://www.casestudy.club/case-studies',
        item: out,
    };
};
