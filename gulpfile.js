const { src, dest, parallel } = require('gulp');
function copyNodeIcons() {
  return src('nodes/**/*.{png,svg}', { allowEmpty: true }).pipe(dest('dist/nodes'));
}
function copyCredentialIcons() {
  return src('credentials/**/*.{png,svg}', { allowEmpty: true }).pipe(dest('dist/credentials'));
}
exports['build:icons'] = parallel(copyNodeIcons, copyCredentialIcons);
