console.log('I articleonmarkdown (aom) generator by goosesima!');

const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');

var aom = {
  outDir: 'docs',
  location: 'https://goosesima.github.io/',
  sitemapHelp: [],
  version: 1.3,
  cacheFile: './cache.txt',
  cache: {},
  articlesHTML: '',
  fullBuild: false,
  imgCache: './docs/cache/',
  quick: false
};

aom.checksum = function (s) {
  var chk = 0x12345678;
  var len = s.length;
  for (var i = 0; i < len; i++) {
      chk += (s.charCodeAt(i) * (i + 1));
  }

  return (chk & 0xffffffff).toString(16);
}
aom.imageWorkerArray = [];
aom.imageWorker = async function (url, path) {
  const setup = {
    timeout: 1000 * 5,
    headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36'
    }
  };
  axios.get(url, {
    responseType: 'arraybuffer'
  }, setup).then(function (e) {
    sharp(e.data).webp({quality: 60}).toFile(path).then(function () {
      console.log('✓ ' + path);
    }).catch(function (err) {
      console.log(err);
      console.log(url);
      fs.appendFile(path, Buffer.from(e.data), function (err) {
          if (err) {
            console.error(err);
          }
      });
    });
  }).catch(function () {
    console.log('[Error] Can not GET image from url: ' + url);
  });
}
aom.image = function (url) {
  if(!url){
    return;
  }
  const path = aom.imgCache + aom.checksum(url) + '.webp';
  var skipImage = false;
  console.log('* ' + path);
  try {
    if (fs.existsSync(path)) {
      skipImage = true;
    }
  } catch(err) {
  }
  if(!skipImage){
    if(url.indexOf('http') > -1){
      aom.imageWorkerArray.push([url, path]);
    }else{
      console.log('Unknown url: ' + url);
    }
  }
  return path.replace(aom.outDir + '/', '');
}
aom.sv = String(aom.version);
if(fs){
  aom.sample = fs.readFileSync('sample.html', {encoding: 'utf-8'});
  aom.sampleindex = fs.readFileSync('indexsample.html', {encoding: 'utf-8'});
  try {
    const t = fs.readFileSync(aom.cacheFile, {encoding: 'utf-8'});
    const g = JSON.parse(t);
    if(g.version != aom.sv){
      aom.fullBuild = true;
    }
    aom.cache = g;
    aom.cache.version = aom.sv;
  } catch (e) {
    console.log('Corrupted cache detected or no access to fs. I gonna rebuild everything!');
  } finally {

  }
}
if(process){
  if(process.argv.indexOf('--clear-cache') > -1){
    aom.cache = {};
  }
  if(process.argv.indexOf('-q') > -1){
    aom.quick = true;
  }
}
aom.getType2 = function (line) {
  return line.replace(line.split(':')[0].toString() + ': ', '');
}
aom.translation = {
  imgElementStart: '<img loading="lazy" class="aom-img" src="',
  cyllyric: {"Ё":"YO","Й":"I","Ц":"TS","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"SH","Щ":"SCH","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"a","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"ZH","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"CH","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"YU","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu","ї":"yi","ґ":"ge", "Ї": "yi", "Ґ":"Ge", 'І': 'I', 'і': 'i'},
  russian: 'йцукенгшщзхъфывапролджэячсмитьбюё'
};
aom.bigArt = '';
aom.dataBuffer = [];
aom.art = `    <div id="article">
      <div id="info" class="lazy" data-img="content/thumbnail.png">
        <div id="text-info">
          <h2>[NAME ARTICLE]</h2>
          <h3>[SHORT DESCRIPTION]</h3>
          <h4>Edited: [EDITED]</h4>
          <a href="[URL]" class="btn">See more</a>
        </div>
      </div>
    </div>`;
aom.isRU = function (text) {
  text = text.toLowerCase();
  for (var i = 0; i < aom.translation.russian.length; i++) {
    const c = aom.translation.russian[i];
    if(text.indexOf(c) > -1){
      return true;
    }
  }
  return false;
}
aom.isUA = function (text) {
  text = text.toLowerCase();
  if(text.indexOf('ы') > -1){
    return false;
  }
  if(text.indexOf('ї') > -1){
    return true;
  }
  if(text.indexOf('і') > -1){
    return true;
  }
  if(text.indexOf('ґ') > -1){
    return true;
  }
  return false;
}
aom.parse = function (txt) {
  var out = {
    title: 'Title not specified',
    author: 'Author not specified',
    authorimg: 'https://www.freeiconspng.com/uploads/error-icon-28.png',
    date: 'Date not specified',
    thumbnail: 'https://www.freeiconspng.com/uploads/error-icon-28.png',
    description: 'Description not specified',
    keywords: 'blog goosesima, блог симагусь, goosesima, sima, goose, сима, гусь, сима дак, серафим гусь, simaduck, duck, линки симагусьа, links goosesima',
    text: '',
    show: true,
    speed: 0,
    lang: 'en'
  };
  out.speed = Math.floor(txt.length / 15 / 60 * 100) / 100;
  out.speed += ' min';
  if(aom.isRU(txt)){
    out.lang = 'ru';
    if(aom.isUA(txt)){
      out.lang = 'ua';
    }
  }
  txt = txt.split('\n');
  for (var i = 0; i < txt.length; i++) {
    const line = txt[i];
    const type = line.split(':')[0].toString().toLowerCase();
    if(out[type] && (type != 'keywords')){
      out[type] = aom.getType2(line);
    }else{
      switch (type) {
        case 'image author':
          out.authorimg = aom.getType2(line);
          break;
        case 'keywords':
          out.keywords = aom.getType2(line) + ', ' + out.keywords;
          break;
        default:
          out.text += line + '\n';
      }
    }
  }
  if(out.author == 'GooseSima'){
    out.authorimg = 'https://goosesima.github.io/img/logo.svg';
  }
  return out;
}
aom.haveOneOfThis = function (text, array) {
  for (var i = 0; i < array.length; i++) {
    if(text.indexOf(array[i]) > -1){
      return array[i];
    }
  }
  return false;
}
aom.isUrl = function (url) {
  const array = ['https://', 'http://', 'www.'];
  for (var i = 0; i < array.length; i++) {
    if(url.startsWith(array[i])){
      return true;
    }
  }
  return false;
}
aom.isImage = function (url) {
  const array = ['.apng', '.avif', '.gif', '.jpg', '.jpeg', '.jfif', '.pjeg', '.pjp', '.png', '.svg', '.webp'];
  return aom.haveOneOfThis(url, array);
}
aom.countChars = function (text, char) {
  var count = 0;
  for (var i = 0; i < text.length; i++) {
    if(text[i] == char){
      count++;
    }
  }
  return count;
}
aom.lineByI = function (array, z) {
  var start = 0;
  var detected = false;
  var end = 0;
  for (var i = 0; i < array.length; i++) {
    if(detected){
      if(array[i] == '\n'){
        end = i;
        return array.join('').substring(start + 1, end);
      }
    }else{
      if(array[i] == '\n'){
        start = i;
      }
      if(i == z){
        detected = true;
      }
    }
  }
}
aom.markReplace = function (text, mark, html) {
  var array = text.split('');
  var array2 = [];
  const h = ['<' + html + '>', '</' + html + '>'];
  var type = false;
  for (var i = 0; i < array.length; i++) {
    var out = array[i];
    const current = array[i];
    var next = '';
    if(array[i + 1]){
      next = array[i + 1];
    }
    var back = '';
    if(array[i - 1]){
      back = array[i - 1];
    }
    const line = aom.lineByI(array, i) || '';
    if(!line.startsWith('<img')){
      if(mark.length == 2){
        if(current == mark[0] && next == mark[1]){
          out = '';
        }
        if(back == mark[0] && current == mark[1]){
          out = h[Number(type)];
          type = !type;
        }
      }else{
        if(current == mark){
          out = h[Number(type)];
          type = !type;
        }
      }
    }
    array2.push(out);
  }
  return array2.join('');
}
aom.transliterate = function(word){
   var answer = '';
   for (var i = 0; i < word.length; i++) {
     if (word.hasOwnProperty(i)) {
       if (aom.translation.cyllyric[word[i]] === undefined){
         answer += word[i];
       } else {
         answer += aom.translation.cyllyric[word[i]];
       }
     }
   }
   return answer;
}
aom.linker = function (text) { //Makes line acceptable as html id/class or http url
  text = aom.transliterate(text).toLowerCase().replaceAll(' ', '-');
  var text2 = [];
  for (var i = 0; i < text.length; i++) {
    if((text[i] == '-') && (i > 0)){
      text2.push(text[i]);
    }else{
      if((text[i].toLowerCase() != text[i].toUpperCase()) || ((Number(text[i])  + 1 - 1) == Number(text[i]))){
        text2.push(text[i]);
      }
    }
  }
  // console.log(text2.join(''));
  return text2.join('');
}
aom.advH = function (number, text) {
  var h = '<h' + number + ' id="' + aom.linker(text) + '">' + text + '</h' + number + '>';
  return '<div class="aom-h">' + h + '<img src="./content/link.png" class="aom-copy" title="Copy as temp-link" alt="Copy as temp-link"></div>';
}
aom.isAltH = function (t) {
  var char = '=';
  if(t.startsWith('-')){
    char = '-';
  }
  return (aom.countChars(t, char) == t.length) && t.length > 0;
}
aom.isYt = function (url) {
  var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  } else {
    return undefined;
  }
}
aom.marktohtml = function (txt) {
  txt = aom.markLinkbased(txt);
  var array = txt.split('\n');
  var array2 = [];
  for (var i = 0; i < array.length; i++) {
    const line = array[i];
    const defaultLine = '<p>' + line + '</p>';
    var backLine = '';
    if(array[i - 1]){
      backLine = array[i - 1];
    }
    var nextLine = '';
    if(array[i + 1]){
      nextLine = array[i + 1];
    }
    if(aom.isUrl(line)){
      if(aom.isImage(line)){
        array2.push(aom.translation.imgElementStart + aom.image(line) + '">');
      }else{
        if(line.endsWith('.js')){
          array2.push('<script src="' + line + '" charset="utf-8"></script>');
        }else{
          if(line.endsWith('.css')){
            array2.push('<link rel="stylesheet" href="' + line + '">');
          }else{
            const ytid = aom.isYt(line);
            if(ytid){
              array2.push('<iframe class="ytplayer" type="text/html" src="http://www.youtube.com/embed/' + ytid + '"   frameborder="0"/> ')
            }else{
              array2.push('<a class="aom-link" href="' + line + '">' + line + '</a>');
            }
          }
        }
      }
    }else{
      if(line.startsWith('#')){ //Headers implementation
        const headersOne = line.split(' ')[0];
        const headersTwo = aom.countChars(headersOne, '#');
        if((headersOne.length == headersTwo) && (headersTwo < 7)){
          var fixedLine = line.replace(line.split(' ')[0], '');
          array2.push(aom.advH(headersTwo, fixedLine));
        }else{
          array2.push(defaultLine);
        }
      }else{ //List implementation
        var char = line.split(' ')[0];
        char = char[char.length - 1];
        if(line.startsWith('1' + char + ' ')){
          var scopeMode = line.startsWith('1) ');

          if(nextLine.startsWith('2' + char + ' ')){
            array2.push('<ol><li>' + line.replace('1' + char + ' ', '') + '</li>');
          }else{
            array2.push('<ol><li>' + line.replace('1' + char + ' ', '') + '</li></ol>');
          }
        }else{
          const countList = line.split(char + ' ')[0];
          if(countList == Number(countList) && countList != ''){
            var out = '<li>' + line.replace(countList + char + ' ', '') + '</li>';
            if(!nextLine.startsWith((Number(countList) + 1) + char + ' ')){
              out += '</ol>';
            }
            array2.push(out);
          }else{
            if(line.startsWith('* ') || line.startsWith('- ')){
              var minus = line.startsWith('- ');
              var fixedLine = '';
              if(minus){
                fixedLine = line.replace('- ', '');
              }else{
                fixedLine = line.replace('* ', '');
              }
              if(backLine.startsWith('* ') || backLine.startsWith('- ')){
                if(nextLine.startsWith('* ') || nextLine.startsWith('- ')){
                  // middle *
                  array2.push('<li>' + fixedLine + '</li>');

                }else{
                  // end *
                  array2.push('<li>' + fixedLine + '</li></ul>');
                }
              }else{
                // first *
                if(nextLine.startsWith('* ') || nextLine.startsWith('- ')){
                  array2.push('<ul><li>' + fixedLine + '</li>');
                }else{
                  array2.push('<ul><li>' + fixedLine + '</li></ul>');
                }
              }

            }else{
              if(line.startsWith('> ')){ //Blockquote
                var fixedLine = defaultLine.replace('> ', '');
                if(nextLine.startsWith('> ')){
                  if(backLine.startsWith('> ')){
                    array2.push(fixedLine);
                  }else{
                    array2.push('<blockquote>' + fixedLine);
                  }
                }else{
                  array2.push(fixedLine + '</blockquote>');
                }
              }else{
                if(aom.isAltH(nextLine)){ //Alternative header
                  var h = 1;
                  if(nextLine.startsWith('-')){
                    h = 2;
                  }
                  array2.push(aom.advH(h, line));
                }else{
                  if(aom.isAltH(line)){
                    //Alternative header ignore
                  }else{
                    //Default
                    array2.push(defaultLine);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  txt = array2.join('\n');
  txt = aom.markReplace(txt, '**', 'b');
  txt = aom.markReplace(txt, '*', 'i');
  txt = aom.markReplace(txt, '__', 'b');
  txt = aom.markReplace(txt, '_', 'i');

  txt = aom.markReplace(txt, '```', 'code');
  txt = aom.markReplace(txt, '`', 'code');
  txt = aom.markReplace(txt, '~~', 'strike');

  return txt;
}
aom.markLinkbased = function (txt) {
  var startSquare = 0, endSquare = 0;
  var isImage = false;
  var findScope = false;
  var txttwo = '';
  for (var i = 0; i < txt.length; i++) {
    const current = txt[i];
    const next = txt[i + 1];
    const back = txt[i - 1];
    if(current == '['){
      startSquare = i;
      findScope = false;
    }else{
      if((current == ']') && (next == '(')){
        endSquare = i;
        isImage = back == '!';
        findScope = true;
      }else{
        if(findScope && (current == ')')){
          const url = txt.substring(endSquare + 2, i);
          const text = txt.substring(startSquare + 1, endSquare);

          txttwo = txttwo.substring(0, txttwo.length - (i - startSquare) + 2);
          if(isImage){
            txttwo += '<img class="aom-img" loading="lazy" img="' + text + '" title="' + text + '" alt="' + text + '" src="' + aom.image(url) + '">';
          }else{
            if(text.startsWith('**') && text.endsWith('**')){
              var t = text.substring(2, text.length - 4);
              txttwo +='<a class="btn" href="' + url + '">' + text + '</a>';
            }else{
              txttwo += '<a class="aom-link" href="' + url + '">' + text + '</a>';
            }
          }
          findScope = false;
        }else{
          txttwo += current;
        }
      }
    }
  }
  return txttwo;
}
aom.artGenerate = function (sample, data, small) {
  var html = sample;
  var ignore = String(data.show)[0].toLowerCase() == 'n';
  if(!small){
    ignore = false;
  }
  if(!ignore){
    html = html.replaceAll('[NAME ARTICLE]', data.title);
    html = html.replaceAll('[SHORT DESCRIPTION]', data.description);
    html = html.replaceAll('[SPEED]', data.speed);
    if(data.edited){
      html = html.replaceAll('[EDITED]', data.edited);
    }
    html = html.replaceAll('[TEXT]', data.text);
    html = html.replaceAll('[AUTHOR NAME]', data.author);
    html = html.replaceAll('[CREATED]', data.date);
    html = html.replaceAll('[KEYWORDS]', data.keywords);
    html = html.replaceAll('content/thumbnail.png', aom.image(data.thumbnail));
    html = html.replaceAll('content/author.png', data.authorimg);
    html = html.replaceAll('[LANG]', data.lang);
    if(data.path){
      html = html.replaceAll('[URL]', data.path);
    }
  }else{
    html = '';
  }
  return html;
}
aom.generate = function (txt, sample, path, edited, date, isNewFile) {
  var data = aom.parse(txt);
  data.path = path;
  data.edited = edited;
  data.date = date;
  if(isNewFile){
    data.text = aom.marktohtml(data.text);
  }
  var html = aom.artGenerate(sample, data);
  aom.dataBuffer.push(data);
  return html;
}
aom.xmlSitemap = function (file) {
  var prefix = aom.location;
  if(file.startsWith('http')){
    prefix = '';
  }
  return '<url><loc>' + prefix + file +'</loc> <lastmod>' + new Date().toISOString() + '</lastmod></url>'
}
aom.build = async function (file, newFile) {
  console.log('Analyzing "' + file + '"');
  const filepath = './material/' + file;
  const finfo = fs.statSync(filepath);
  const edited = finfo.mtime;
  const date = finfo.birthtime;
  const editedStr = edited.toLocaleString();
  const newFilepath = './' + aom.outDir + '/' + newFile.split('T')[0];
  const content = fs.readFileSync(filepath, {encoding: 'utf-8'});
  var isNewFile = (aom.cache[file] !== String(editedStr)) || aom.fullBuild;
  if(aom.quick){
    isNewFile = true;
    try {
      if (fs.existsSync(newFilepath)) {
        isNewFile = false;
      }
    } catch(err) {
    }
  }
  const html = aom.generate(content, aom.sample,  newFile, editedStr, date.toLocaleString(), isNewFile);
  if(isNewFile){
      console.log('Building "' + file + '"');
      fs.writeFile(newFilepath, html, {encoding: 'utf-8'}, function () {});
      aom.cache[file] = editedStr;
  }else{
    console.log('Skipped "' + file + '"');
  }
  return newFile;
}
aom.updateAll = function () {
  if(!fs){
    console.log('Warn: update impossible. No fs module detected.');
  }
  console.log('Update files...');
  var i = 0;
  var z = 0;
  fs.writeFileSync('./' + aom.outDir + '/sitemap.xml', '', {encoding: 'utf-8'}, function () {

  });
  var fnames = [aom.xmlSitemap('')];
  for (var i = 0; i < aom.sitemapHelp.length; i++) {
    fnames.push(aom.xmlSitemap(aom.sitemapHelp[i]));
  }
  var z = 0;
  const files = fs.readdirSync('material');
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const filenameArray = file.split('.');
      const filetype = filenameArray[filenameArray.length - 1];
      const newFile = file.replace(filetype, 'html');
      fnames.push(aom.xmlSitemap(newFile));
      aom.build(file, newFile).then(function (e) {
        z++;
        console.log('Builded: ' + e);
        if(z == (files.length - 1)){
          for (var x = 0; x < aom.dataBuffer.length; x++) {
            aom.articlesHTML += aom.artGenerate(aom.art, aom.dataBuffer[x], true);
          }
          fs.writeFile('./' + aom.outDir + '/index.html', aom.sampleindex.replace('[HTML]', aom.articlesHTML), function () {
            console.log('Builded index.html');
          });
          fs.writeFile(aom.cacheFile, JSON.stringify(aom.cache), function () {
            console.log('Cache upgraded!');
          });
          fs.writeFile('./' + aom.outDir + '/sitemap.xml', '﻿<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + fnames.join('\n') + '</urlset>', {encoding: 'utf-8'}, function () {

          });
          for (var i = 0; i < aom.imageWorkerArray.length; i++) {
            aom.imageWorker(aom.imageWorkerArray[i][0], aom.imageWorkerArray[i][1]).then(function () {

            });
          }
        }
      });
    }
}
if(fs){
  aom.updateAll();
}
