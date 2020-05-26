const got = require('@/utils/got');
// const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'GET',
        url: 'https://www.nationalgeographic.com/latest-stories/_jcr_content/content/hubfeed.promo-hub-feed-all-stories.json?offset=0&max=18',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
        },
    });

    const data = response.data;

    ctx.state.data = {
        title: '国家地理 National Geographic',
        link: 'https://www.nationalgeographic.com/',
        item: data.map((item) => ({
            title: item.components[0].title.text,
            pubDate: new Date(item.date).toUTCString(),
            link: item.uri,
        })),
    };
};
