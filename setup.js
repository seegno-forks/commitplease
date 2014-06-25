(function avoidSelfInstall() {
  var pkg = require('./package'),
    nameRegex = new RegExp('node_modules/' + pkg.name + '$');
  if (!nameRegex.test(process.cwd().replace(/\\/g, '/'))) {
    console.log('running install inside self, no need');
    process.exit(0);
  }
}());

var path = require('path');
var fs = require('fs');
var root = path.resolve(__dirname, '../..');
var git = path.resolve(root, '.git');
var hooks = path.resolve(git, 'hooks');

// Check if we are in a git repository so we can bail out early when this is not the case.
if (!fs.existsSync(git) || !fs.lstatSync(git).isDirectory()) {
  console.error('Could not find git repo in ' + git);
  process.exit(0);
}

if (!fs.existsSync(hooks)) {
  fs.mkdirSync(hooks);
}

var commitMsgHook = path.resolve(hooks, 'commit-msg');
var commitMsgCheck = path.resolve(hooks, 'commit-msg-check');

var commitMsgHookFile = path.relative(path.resolve(hooks), './commit-msg-hook.sh');
var commitMsgCheckFile = path.relative(path.resolve(hooks), './commit-msg-check.py');

var context = {
  hook: commitMsgHook,
  create: function() {
    try {
      fs.writeFileSync(commitMsgHook, fs.readFileSync(commitMsgHookFile));
      fs.writeFileSync(commitMsgCheck, fs.readFileSync(commitMsgCheckFile));

      fs.chmodSync(commitMsgHook, '755');
      fs.chmodSync(commitMsgCheck, '755');
    } catch(e) {
      if (/EPERM/.test(e.message)) {
        console.error('Failed to write commit-msg hook. ' +
          'Make sure you have the necessary permissions.');
      }

      throw e;
    }
  },
  destroy: function() {
    fs.unlinkSync(commitMsgHook);
    fs.unlinkSync(commitMsgCheck);
  }
};

if (fs.existsSync(commitMsgHook)) {
  context.hookExists = true;
  var content = fs.readFileSync(commitMsgHook, 'utf-8');
  if (content && content.split('\n')[ 1 ] === '# commitplease-original') {
    context.selfmadeHook = true;
  }
}

module.exports = context;
