const cheerio = require('cheerio');
const got = require('@/utils/got');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const url = `https://sketchrepo.com/all/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.resources .card').get();
    list.splice(3, 1);
    list.splice(6, 1);
    list.splice(9, 1);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let title = $('.card-title').text();
            let category = $('.collection a').text();
            const imageUrl = `<img src="` + $('.resource').attr('src') + `"/>`;
            const description = imageUrl;
            const itemUrl = $('.image-wrapper').attr('href');
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
        title: 'SKETCHREPO Sketch免费素材',
        link: 'https://sketchrepo.com/all/',
        item: out,
    };
};
