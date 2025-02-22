const YTDLP = require('./index');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const ytdlp = new YTDLP({ folderBinary: '.ytdlp' });
    await delay(5000);
    let video = 'https://www.facebook.com/share/r/1Qr1DEgJ2U/';
    console.log(await ytdlp.possibleURL(video));
    console.log(await ytdlp.downloadVideo(video));
    //console.log(await ytdlp.checkVideoInfo(video));
})();