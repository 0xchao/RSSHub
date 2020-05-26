const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://growth.design/case-studies/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.isotope-container > .tmb').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.t-entry-title').text();
            const imageUrl = `<img src="` + $('.pushed img').attr('data-guid') + `">`;
            const link = $('.pushed').attr('href');
            const single = {
                title: title,
                description: imageUrl + '<br/>' + title,
                link: link,
                guid: link,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Case Stuudies | Growth Design',
        link: 'https://growth.design/case-studies/',
        item: out,
    };
};
