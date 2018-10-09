const shell = require('shelljs');
const path = require('path');

const targetVariable = 'BUILD_VERSION';
const folder = path.join('dist', 'js');

// we will use git commit hash as the version
let version = '';

const gitDescribe = shell.exec('git describe --always --long', { silent: true });

version = gitDescribe.stdout.replace('\n', '');

if (version === '') {
  console.log('no version defined\naborting...');
  shell.exit(1);
  return;
}

// find the target javascript file
let filepath = shell.find(folder).filter(file => file.match(/(app)\.(\w*)(\.js)$/m));

if (filepath.length < 1) {
  console.log(`could not find our app.js file in folder ${folder}`);
  shell.exit(1);
}

filepath = filepath.length > 0 && filepath[0];

// if the target file does not have our target variable to write to
// we should let the user know
const fileHasString = variable => shell.grep(variable, filepath).stdout.replace('\n', '').length > 0;

if (!fileHasString(targetVariable)) {
  console.log(`our target file (${filepath}) does not have our target variable (${targetVariable})`);
  shell.exit(1);
  return;
}


console.log(`found target file ${filepath}`);

shell.sed('-i', targetVariable, version, filepath);

if (!fileHasString(version)) {
  console.log(`our attempt to write ${version} to ${filepath} failed...`);
  shell.exit(1);
  return;
}

console.log(`wrote build version '${version}' to ${filepath}`);

shell.exit(0);
