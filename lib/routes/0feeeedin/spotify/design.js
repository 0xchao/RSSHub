const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://spotify.design/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.StoryItem').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const times = $('.StoryItem-date')
                .text()
                .trim();
            const month = times.slice(0, 2);
            const day = times.slice(3, 5);
            const year = `20` + times.slice(6, 8);
            const time = year + `.` + month + `.` + day;
            let title = $('.StoryItem-title p').text();
            const category = $('.StoryItem-category').text();
            const imageUrl1 = `<img src="` + $('.StoryItem-imageWrapper img').attr('src') + `"/><br/>`;
            const imageUrl = imageUrl1.replace('w580', 'w920');
            const description = imageUrl + $('.StoryItem-imageWrapper img').attr('alt');
            const itemUrl = 'https://spotify.design' + $('.StoryItem-link').attr('href');
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
        title: 'Spotify Design 官方博客',
        link: 'https://spotify.design/',
        item: out,
    };
};
