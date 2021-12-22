const got = require('@/utils/got');
// const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://s3.amazonaws.com/infobeautiful-bnews/data/data.json',
        headers: {
            Referer: 'https://informationisbeautiful.net/beautifulnews/',
        },
    });

    const data = response.data.data.items;

    ctx.state.data = {
        title: 'Beautiful News Daily',
        link: 'https://informationisbeautiful.net/beautifulnews/',
        description: 'Beautiful News Daily',
        item: data.map((item) => ({
            title: item.headline,
            description: `<img src="https://s3.amazonaws.com/infobeautiful-bnews/images/${item.id}/${item.filename}.svg"><br/><p>${item.description}</p>`,
            pubDate: new Date(item.publish_date).toUTCString(),
            category: item.topic,
            link: `https://informationisbeautiful.net/beautifulnews/${item.filename}`,
        })),
    };
};
