const got = require('@/utils/got');
const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'POST',
        url: 'https://spectacle.is/api/search/basic',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
            'Content-Type': 'application/json;charset=UTF-8',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
        },
        body: '{"categories":{},"tags":["featured"],"exclude":[],"size":20,"from":0,"silent":true,"ids":[],"block":true}',
    });

    const data = response.data.data;

    ctx.state.data = {
        title: 'Spectacle 全球营销视频精选',
        link: 'https://spectacle.is/',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="${item.thumbnail}">`,
            pubDate: new Date(item.date).toUTCString(),
            link: `https://spectacle.is/video/${item.slug}`,
        })),
    };
};
