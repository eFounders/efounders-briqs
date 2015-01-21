
slackApi = function (api, params) {
  if(!params) params = {};
  params.token = Meteor.settings.slackToken;

  var result = HTTP.call('GET', 'https://slack.com/api/'+api, { params: params });
  if(!result.data.ok)
    throw new Error('Failed to get /'+api+' from Slack API: ' + result.data.error);
  return result.data;
};

slackChat = function (msg, params, force) {
  if(!params) params = {};
  if(!params.channel) params.channel = '#random';
  if(!params.username) params.username = 'Robby The Robot';
  if(!params.icon_emoji) params.icon_emoji = ':cubimal_chick:';
  params.text = msg;

  if(isProduction() || force) {
    try {
      slackApi('chat.postMessage', params);
    } catch(e) {
      console.error('Cannot send the chat', e, msg, params);
    }
  } else {
    console.log('SLACK:', msg, params);
    return;
  }
};

var _slackCommands = {};


Meteor.methods({
  slackCommand: function(command, params) {
    check(command, String);
    check(params, String);
    var q = {
      user_id: this.userId,
      command: command,
      token: '',
      text: params
    };    
    console.log('res', execCommand(q));
  }
});

Router.route('slackCommands', function () {
  this.response.end(execCommand(this.params.query));
}, { where: 'server' });

var execCommand = function (q) {
  console.log('cmd asked with query:', q);

  var cmd = _slackCommands[q.command.substr(1)];

  if(!cmd) return 'Unknown Slack command: ' + q.command;

  if(cmd.token && cmd.token !== q.token) return 'Bad Slack token';

  // remove duplicated whitespaces and split params
  var slackParams = q.text ? q.text.replace(/\++/g,' ').split(' ') : [];
  console.log('Slack params', slackParams);
  if(slackParams.length < cmd.minParamsCount) return 'This command needs at least '+cmd.minParamsCount+' parameters';

  var from = member(q.user_id);
  if(!from) return 'I don\'t know you: ' + q.user_id;

  if(cmd.right === 'user' && isGuest(from)) return 'You cannot execute this command';
  if(cmd.right === 'admin' && !isAdmin(from)) return 'You cannot execute this command';
  return cmd.action(q, from, slackParams);
};

slackCommand = function (right, name, minParamsCount, token, action) {
  _slackCommands[name] = { right: right, name: name, minParamsCount: minParamsCount, token: token, action: action };
};
