var editor = ace.edit('editor');
var marked = require('marked');
var highlightjs = require('highlight.js');

ace.config.set('basePath', 'site://ace-builds/src-noconflict/');
editor.getSession().setUseWorker(false);

editor.setTheme('ace/theme/github');
editor.session.setMode('ace/mode/markdown');


const renderer = new marked.Renderer();

renderer.code = (code, language) => {
  const validLang = !!(language && highlightjs.getLanguage(language));
  const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};


function repaint() {
    var text = editor.getValue();

    marked.setOptions({renderer});
    var html = marked(text);

    document.getElementById('preview').innerHTML = html;
};

const {ipcRenderer} = require('electron');

ipcRenderer.on('openFile', function(event, data) {
    editor.setValue(data.value, -1);
});

ipcRenderer.on('saveFile', function(event, data) {
    event.sender.send('fileContents', {file: editor.getValue(), path: data.path});
});

ipcRenderer.on('setPath', function(event, data) {
    if(data.path == null) {
	document.getElementById('filepath').textContent = 'Unsaved file';
	document.getElementById('filepath').className = 'unsaved';
	editor.setValue('');
    } else {
	document.getElementById('filepath').textContent = data.path;
	document.getElementById('filepath').className = '';
    }
});

ipcRenderer.on('fileSaved', function(event, data) {
    var popup = document.getElementById('save-popup');
    console.log('saving');
    popup.className += ' active';
    setTimeout(() => {
	popup.className = popup.className.replace(' active', '');
    }, 2500);
});

editor.getSession().on('change', function() {
    repaint();
});

repaint();
