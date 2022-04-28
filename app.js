const http = require('http');
const url = require('url');
const yaml = require('js-yaml');
const fs = require('fs');
const jsdom = require("jsdom");
const pathmodule = require('path');


const hostname = 'localhost';
const port = 3000;
const baseDir = __dirname + "/";
const debug = false;

const { JSDOM } = jsdom;

function findBySongName(searchName) {
    if (searchName == '') {
        return '<p>Please input song name.</p><p>請輸入歌名。</p>';
    }
    try {
        // 1. Read YAML file for the lyrics
        const resolvedPath = pathmodule.resolve(baseDir + 'songs/' + searchName + '.yaml'); // resolve will resolve "../"
        if (resolvedPath.startsWith(baseDir + 'songs')) {
            const text = yaml.load(fs.readFileSync(resolvedPath, 'utf8'));
            const indentedJson = JSON.stringify(text, null, 4);
            logDebugMessage("Content: " + indentedJson);

            const title = text.title;
            const lyricist = text.lyricist;
            const composer = text.composer;
            const arrangement = text.arrangement;
            const producer = text.producer;
            const artist = text.artist;
            const videoUrl = text.url;
            let lyrics = text.lyrics;
            logDebugMessage(lyrics);

            let formattedLyrics = lyrics.replace(/(?:\r\n|\r|\n)/g, '<br>')
            logDebugMessage(formattedLyrics);

            // 2. Read Template File
            const templHtml = readTemplateFile('song.templ.html');
            logDebugMessage('templHtml: ' + templHtml));

            // 3. Construct the HTML using the Template File
            var dom = new JSDOM(templHtml);
            var heading = dom.window.document.createElement("h2");
            var headingText = dom.window.document.createTextNode(title);
            heading.appendChild(headingText);
            dom.window.document.querySelector("article").appendChild(heading);

            var content = createIntroRow(dom, '填詞 / Lyricist：', lyricist);
            dom.window.document.querySelector("article").appendChild(content);

            if (composer) {
                content = createIntroRow(dom, '作曲 / Composer：', composer, false);
                dom.window.document.querySelector("article").appendChild(content);
            }

            if (arrangement) {
                content = createIntroRow(dom, '編曲 / Arranged by：', arrangement, false);
                dom.window.document.querySelector("article").appendChild(content);
            }

            if (producer) {
                content = createIntroRow(dom, '監製 / Producer：', producer, false);
                dom.window.document.querySelector("article").appendChild(content);
            }

            if (artist) {
                content = createIntroRow(dom, '原唱 / Artist：', artist, false);
                dom.window.document.querySelector("article").appendChild(content);
            }

            if (videoUrl) {
                content = createIntroRow(dom, 'View Video', videoUrl, true);
                dom.window.document.querySelector("article").appendChild(content);
            }

            if (formattedLyrics) {
                content = dom.window.document.createElement("hr");
                dom.window.document.querySelector("article").appendChild(content);

                formattedLyrics += '<p>'  + formattedLyrics + '</p>';
                var domLyrics = new JSDOM(formattedLyrics);
                content = domLyrics.window.document.querySelector("p");
                content.classList.add('pt-3');
                content.id = 'lyrics';
                dom.window.document.querySelector("article").appendChild(content);
            }

            return dom.serialize();
        } else {
            return "<p>Not allowed.</p>";
        }
        //return templHtml;
    } catch (e) {
        console.log(e);
        return "<p>Not found.</p>";
    }
}

function createIntroRow(dom, colName, colText, isUrl) {
    var content = dom.window.document.createElement("div");

    var contentSpan;
    if (!isUrl) {
        content.classList.add('row', 'intro', 'p-2');
        contentSpan = dom.window.document.createElement("div");
        contentSpan.classList.add('col-4', 'col-md-2', 'p-2');
        var contentText = dom.window.document.createTextNode(colName);
        contentSpan.appendChild(contentText);
        content.appendChild(contentSpan);
    
        contentSpan = dom.window.document.createElement("div");
        contentSpan.classList.add('col-8', 'col-md-10', 'p-2');
        contentText = dom.window.document.createTextNode(colText);
        contentSpan.appendChild(contentText);
        content.appendChild(contentSpan);    
    } else {
        content.classList.add('row', 'p-2');
        var imageNode = dom.window.document.createElement("img");
        imageNode.src = '/images/view-video.png';
        imageNode.id = 'view-video';
        contentSpan = dom.window.document.createElement("a");
        contentSpan.href = colText;
        contentSpan.target = '_blank';
        contentSpan.appendChild(imageNode);
        content.appendChild(contentSpan);
    }

    return content;
}

function logDebugMessage(message) {
    if (debug) {
        console.log(message);
    }
}

function sendFileContent(response, fileName, contentType){
    fileName = baseDir + 'html/' + fileName;
    logDebugMessage(fileName);

    const resolvedPath = pathmodule.resolve(fileName); // resolve will resolve "../"
    if (resolvedPath.startsWith(baseDir + 'html')) {
        fs.readFile(fileName, function(err, data){
            if(err){
                response.writeHead(404);
                response.write("File Not Found!");
            } else{
                response.writeHead(200, {'Content-Type': contentType});
                response.write(data);
            }
            response.end();
        });
    }
}

function readTemplateFile(fileName) {
    let templHtml = '';
    fileName = baseDir + 'html/templates/' + fileName;
    templHtml = fs.readFileSync(fileName, 'utf8');

    return templHtml;
}

/**
 * Main Program - Start Server
 */
const server = http.createServer((req, res) => {
    logDebugMessage(req.url);

    if (req.url.includes('.css')) {
        sendFileContent(res, req.url.toString().substring(1), "text/css");
    } else if (req.url.includes('.js')) {
        sendFileContent(res, req.url.toString().substring(1), "text/javascript");
    } else if (req.url.includes('.jpg')) {
        sendFileContent(res, req.url.toString().substring(1), "image/jpg");
    } else if (req.url.includes('.png')) {
        sendFileContent(res, req.url.toString().substring(1), "image/png");
    } else if ((req.url == '/') || (req.url.includes('.html'))) {
        let reqUrl = req.url;
        if (req.url == '/') {
            reqUrl = 'index.html';
        }
        const resolvedPath = pathmodule.resolve(baseDir + 'html/' + reqUrl); // resolve will resolve "../"
        if (resolvedPath.startsWith(baseDir + 'html')) {
            fs.readFile(resolvedPath,function(err,data){
                if(err){
                    res.writeHead(404);
                    res.write("<p>Page Not found.</p>");
                } else{
                    res.writeHead(200, {
                        'Content-Type': 'text/html;charset=UTF8'
                    });
                    res.end(data);
                }
            });
        }
    } else {
        const queryObject = url.parse(req.url,true).query;
        let searchName = '';
        if (queryObject.songName) {
            searchName = queryObject.songName;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        let htmlText = findBySongName(searchName);
        logDebugMessage(htmlText);

        res.end(htmlText);
    }
});
    
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

