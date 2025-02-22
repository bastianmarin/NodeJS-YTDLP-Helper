/*  
    Name: YTDLP.js
    Author: iroaK
    Description: Controlador de Descargas de Videos de YouTube
*/

// Librerias del Script
const fs = require('fs');
const path = require('path');
const YTDlpWrap = require('yt-dlp-wrap').default;

// Clase Principal
class YTDLP {

    /**
    *   Constructor de la clase.
    *   @param {Object} [options={}] - Opciones para inicializar la clase.
    *   @param {string} [options.tempFile='TempYTDLP.mp4'] - Nombre del archivo temporal.
    *   @param {string} [options.nameBinary] - Nombre del binario de YTDLP, por defecto 'ytdlp.exe' en Windows y 'ytdlp' en otros sistemas.
    *   @param {string} [options.folderBinary='.ytdlp'] - Carpeta donde se almacenará el binario de YTDLP.
    */
    constructor(options = {}){
        
        // Configuraciones de la Clase
        this.isDownloading = false;

        // Variables de la Clase        
        options.tempFile = options.tempFile ?? 'TempYTDLP.mp4';
        options.nameBinary = options.nameBinary ?? process.platform === 'win32' ? 'ytdlp.exe' : 'ytdlp';
        options.folderBinary = options.folderBinary ?? '.ytdlp';
        options.pathFolder = path.join(__dirname, options.folderBinary);
        options.pathFile = path.join(__dirname, options.folderBinary, options.nameBinary);
        for(let key in options) this[key] = options[key];

        // Posibles Regexs
        this.regexUrls = [
            /https?:\/\/(?:www\.)?facebook\.com\/.+/i,
            /https:\/\/fb\.watch\/[a-zA-Z0-9_-]+/,
            /https:\/\/(www\.)?(vm\.)?tiktok\.com\/\S*/,
            /https:\/\/(www\.)?instagram\.com\/\S*/,
            /https:\/\/(www\.)?(x\.com|twitter\.com)\/\S*/,
            /https:\/\/(www\.)?reddit\.com\/\S*/
        ];

        // Inicializar el YTDLP
        fs.mkdirSync(options.folderBinary, { recursive: true });
        YTDlpWrap.downloadFromGithub(this.pathFile);
        this.ytDlpWrap = new YTDlpWrap(this.pathFile);

    }

    /**
    *   Pausa la ejecución del código durante un tiempo específico.
    *   @param {number} time - El tiempo en milisegundos para pausar la ejecución.
    *   @returns {Promise<void>} Una promesa que se resuelve después del tiempo especificado.
    */
    async delay(time){
        return new Promise(resolve => setTimeout(resolve, time));
    }

    /**
    *   Descarga un video desde una URL.
    *   @param {string} URL - La URL del video a descargar.
    *   @returns {Promise<string|boolean>} - La ruta del archivo descargado si tiene éxito, de lo contrario, false.
    */
    async downloadVideo(URL){
        if(this.isDownloading){
            await this.delay(1000);
            return await this.downloadVideo(URL);
        } else {
            let currentTime = new Date();
            this.isDownloading = true;
            try {
                let pathVideo = `${this.pathFolder}/${this.tempFile}`;
                if(fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                await this.ytDlpWrap.execPromise([ URL, '-f mp4', '-o', `${this.pathFolder}/${this.tempFile}` ]);
                this.isDownloading = false;
                return {
                    status: true,
                    data: pathVideo,
                    time: new Date() - currentTime
                };
            } catch(e) {
                this.isDownloading = false;
                return {
                    status: false,
                    data: e
                }
            }
        }
    }
    
    /**
    *   Verifica si la URL proporcionada coincide con alguno de los patrones de expresiones regulares.
    *   @param {string} resolveURL - La URL que se va a verificar.
    *   @returns {Promise<boolean>} - Retorna una promesa que resuelve en `true` si la URL coincide con algún patrón, de lo contrario `false`.
    */
    async possibleURL(resolveURL){
        let isPossible = false;
        for(let regex of this.regexUrls){
            if(regex.test(resolveURL)){
                isPossible = true;
                break;
            }
        }
        return isPossible;
    }

}

// Exportar la Clase
module.exports = YTDLP;