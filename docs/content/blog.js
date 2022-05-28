
window.alert = function(text){
  var p = document.createElement('div');
  var g = document.createElement('p');
  p.className = 'alert';
  g.innerText = text;
  p.appendChild(g);
    setTimeout(function(){
      p.classList.add('alertgoodbye');
      setTimeout(function(){
        p.parentNode.removeChild(p);
      },400)
    },5000);
  document.body.appendChild(p);
  setTimeout(function(){p.classList.add('alerthello');},100);
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    if(successful){
      alert('Copied! / Скопировано!');
    }else{
      alert('Error! / Ошибка!');
    }
  } catch (err) {
    alert('Error in console! / Ошибка в консоле!');
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    alert('Copied! / Скопировано!');
  }, function(err) {
    alert('Error in console! / Ошибка в консоле!');
    console.log('Could not copy text: ', err);
  });
}

var copys = document.getElementsByClassName('aom-copy');
for (var i = 0; i < copys.length; i++) {
  copys[i].onclick = function (e) {
    const i = e.target.parentElement.querySelectorAll('*')[0].id;
    console.log(i);
    const url = location.href.split('#')[0];
    const tempurl = url + '#' + i;
    copyTextToClipboard(tempurl);
  }
}
function search(text) {
  var url = 'https://duckduckgo.com/?q=site%3Agoosesima.github.io+';
  url += encodeURIComponent(text);
  location.href = url;
}
function addSearch(e) {
  var input = document.createElement('input');
  input.type = 'search';
  input.id = 'search';
  input.style.backgroundRepeat = 'no-repeat';
  input.style.backgroundSize = '20px';

  input.placeholder = '🔍 Search for articles';
  input.onkeyup = function (e) {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          search(input.value);
      }
  }
  // Add animation typing text to input "Search for articles"
  var searchForArticles = '🔍 Search for articles';
  var timer;
  function type(text) {
    var i = 0;
    timer = setInterval(function() {
      input.value = text.substr(0, i);
      i++;
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, 100);
  }
  // On focus stop timers
  input.onfocus = function () {
    if(timer) {
      clearInterval(timer);
    }
    input.value = '';
  }
  type(searchForArticles);
  e.appendChild(input);
}
addSearch(document.getElementById('topbar'));