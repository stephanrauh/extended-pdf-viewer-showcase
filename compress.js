const brotli = require('brotli');
const fs = require('fs');

var dir = require('node-dir');

const start = new Date().getTime();

dir.files('dist/pdf-showcase', function(err, files) {
  if (err) throw err;
  files.forEach(f => compress(f));
  const end = new Date().getTime();
  console.log('Compressing took ' + (end - start) / 1000 + ' seconds');
  console.log('TODO: use https://github.com/mscdex/node-ftp to check if the file has changed')
});

function compress(file) {
  if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html') || file.endsWith('.pdf') || file.endsWith('.md')) {
    const content = fs.readFileSync(file);
    if (content.length > 1000) {
      const result = brotli.compress(content, {
        mode: 0, // 0 = generic, 1 = text, 2 = font (WOFF2)
        quality: 11, // 0 - 11
        lgwin: 22 // window size
      });
      if (result != null && result.length < content.length) {
        fs.writeFileSync(file + '.br', result);
        const reduction = content.length - result.length;
        console.log(file + ' Reduction: ' + reduction + ' bytes ' + Math.round((reduction * 100) / content.length) + '%');
      }
    }
  }
}

/*
const content = fs.readFileSync('package.json');
console.log(content);
const result = brotli.compress(content, {
  mode: 0, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 11, // 0 - 11
  lgwin: 22 // window size
});
fs.writeFileSync('README.md.br', result);
*/
