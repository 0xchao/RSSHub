const got = require('@/utils/got');
const url = require('url');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.manamana.net/api/video/findVideoList?industryId=&professionId=&orderByType=0&isOriginal=&hotTag=&pageIndex=1&pageSize=20&dateType=',
        headers: {
            Referer: 'https://www.manamana.net/explorevideo',
        },
    });

    const data = response.data.data.list;

    ctx.state.data = {
        title: 'MANA新媒体 | 发现视频',
        link: 'https://www.manamana.net/explorevideo',
        description: 'MANA新媒体',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="${item.thumb}"><br/><p>${item.title} - ${item.nickName}</p>`,
            pubDate: formatPubDate(item.date),
            author: item.nickName,
            link: `https://www.manamana.net/video/detail?id=${item.videoId}`,
        })),
    };
};
