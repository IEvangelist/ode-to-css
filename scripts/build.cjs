const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dist = path.join(root, 'dist');
const htmlFiles = ['index.html', 'kontiki2.html'];
const styleFiles = [
  'styles/layers.css',
  'styles/reset.css',
  'styles/tokens.css',
  'styles/base.css',
  'styles/layout.css',
  'styles/components.css',
  'styles/pages/home.css',
  'styles/pages/kontiki2.css',
  'styles/motion.css'
];
const fontSource = path.join(
  root,
  'node_modules',
  '@fontsource-variable',
  'recursive',
  'files',
  'recursive-latin-full-normal.woff2'
);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of htmlFiles) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

const styles = styleFiles
  .map((file) => `/* ${file} */\n${fs.readFileSync(path.join(root, file), 'utf8').trim()}`)
  .join('\n\n');

fs.writeFileSync(path.join(dist, 'styles.css'), `${styles}\n`);
fs.mkdirSync(path.join(dist, 'fonts'), { recursive: true });
fs.copyFileSync(fontSource, path.join(dist, 'fonts', 'recursive-latin-full-normal.woff2'));
fs.cpSync(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
