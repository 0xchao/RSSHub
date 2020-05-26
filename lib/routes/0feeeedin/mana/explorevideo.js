const got = require('@/utils/got');
// const url = require('url');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.manamana.net/api/video/findVideoList',
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
            description: `<img src="${getThumb(item.thumb)}"><br/><p>${item.title} - ${item.nickName}</p>`,
            pubDate: formatPubDate(item.date),
            author: item.nickName,
            link: `https://www.manamana.net/video/detail?id=${item.videoId}`,
        })),
    };
    function getThumb(thumb) {
        if (thumb.indexOf('https://video.manamana.net') > -1) {
            return thumb;
        } else {
            return 'https://image.manamana.net/' + thumb;
        }
    }
};
