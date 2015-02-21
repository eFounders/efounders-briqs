///ping to keep alive
if(Meteor.settings.pingKeepAlive) {
  Meteor.setInterval(function() {
      Meteor.http.get(Meteor.absoluteUrl());
      console.log('ping site')
  }, 300000); // every 5 minutes (300000)
}

// Every 4 hours, the banq gives a briq to everybody
Meteor.setInterval(function() {
  Members.update({ 'slack.is_restricted': false }, { $inc: { 'briqs.canGive': 1 } }, { multi: true });
  console.log('Everybody has one more briq.');
}, 1000 * 60 * 60 * 4);

Meteor.publish('briqLogs', function () {
  if(this.userId)
    return BriqLogs.find({}, { sort: { createdAt: -1 }, limit: 50 });
  else
    this.ready();
});

slackCommand('user', 'briq', 0, '', function (query, from, slackParams) {
  var user;
  var name;

  if(query.text) {
    user = member(query.text);
    if(!user) return 'hum, unknown slack user ' + query.text;
    name = user.slack.name + ' has';
  } else {
    user = from;
    name = 'You have';
  }

  var has = (user.briqs && user.briqs.has) ? user.briqs.has : 0;

  return name + ' ' + has + 'bq and can give ' + user.briqs.canGive + 'bq';
});

slackCommand('user', 'give', 2, '', function (query, from, slackParams) {
  if(!from.briqs || !from.briqs.canGive) return 'You don\'t have briqs to give';

  var toName = slackParams.shift();
  var to = member(toName);

  var find;
  if(to) {
    find = { 'slack.deleted': false, 'slack.is_restricted': false, _id: to._id };
  } else {
    var memberIds = [];
    var memberNames = [];
    var members = toName.split(',');
    if(members.length > 1) {
      _.each(members, function (m) {
        console.log('m', m);
        var mu = member(m);
        if(mu && mu._id != from._id) {
          memberIds.push(mu._id);
          memberNames.push(mu.slack.name);
        }
      });
      toName = memberNames.join(',');
      find = { 'slack.deleted': false, 'slack.is_restricted': false, _id: { $in: memberIds } };
    }
  }
  var nbMembers = Members.find(find).count();
  if(nbMembers === 0) return 'Unknown Slack user ' + toName;

  if(to && from._id === to._id) return 'Do you REALLY think it could be so easy? Seriously? Come on!';

  var amount = parseInt(slackParams.shift());
  if(amount <= 0) return 'Please set a real number of briq you want to give. '+amount+' is not a valid number';
  if(nbMembers * amount > from.briqs.canGive) return 'You are generous but you can only give '+from.briqs.canGive+'bq';
  if(amount > 6) return 'You are generous but please, don\'t give more than 6bq!';

  var reason = '';
  if(slackParams.length >= 1)
    reason = slackParams.join(' ');

  if(amount > 0)
    Members.update(from._id, { $inc: { 'briqs.canGive': -nbMembers * amount, 'briqs.gave': nbMembers * amount } });

  Members.update(find, { $inc: { 'briqs.has': amount } }, { multi: true });

  var newCanGive = from.briqs.canGive - nbMembers * amount;

  Members.find(find).forEach(function (u) {
    console.log(u.slack.name);
    BriqLogs.insert({createdAt: new Date(), fromId: from._id, toId: u._id, amount: amount, reason: reason});

    var msgTo = from.slack.name + ' gave you ' + amount + 'bq. You have now ' + u.briqs.has + 'bq.';
    if(reason) msgTo += ' Reason: '+reason;
      slackChat(msgTo, { channel: '@' + u.slack.name, username: 'Banq', icon_emoji: ':moneybag:' });
  });

  var msgAll = from.slack.name + ' (' + newCanGive + 'bq left) gave ' + amount + 'bq to ' + toName;
  if(reason) msgAll += ' Reason: ' + reason;
    slackChat(msgAll, { channel: '#banq', username: 'Banq', icon_emoji: ':moneybag:' });

  if(query.channel_name !== 'banq')
    slackChat(msgAll, { channel: query.channel_id, username: 'Banq', icon_emoji: ':moneybag:' });

  return 'You gave ' + (nbMembers * amount) + 'bq to ' + toName + '. You still can give ' + newCanGive + 'bq.';
});
