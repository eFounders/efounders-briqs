

//
// Members
//


Meteor.publish('members', function () {
  if(this.userId)
    return Members.find({ 'slack.deleted': false, 'slack.is_restricted': false });
  else
    this.ready();
});

Members.allow({
  insert: function (userId, doc) {
    return false;
  },
  update: function (userId, doc, fields, modifier) {
    return false;
  },
  remove: function (userId, doc) {
    return false;
  }
});

// every 10mn, update slack members
Meteor.setInterval(function () {
  updateSlackMembers();
}, 1000 * 60 * 10);

Meteor.startup(function () {
  if(Members.find().count() === 0)
    updateSlackMembers();
});

Meteor.methods({
  forceUpdateSlack: function () {
    if(!isAdmin(this.userId)) return;
    updateSlackMembers();
  }
});

// return the member document. id can be a slackname, a @slackname, a slackid or a _id
member = function(id) {
  if(!id) return;

  if(typeof id == 'object') return member;

  id = id.trim();
  if(id.length <= 0) return;
  if(id[0] === '@') id = id.substr(1);

  var member = Members.findOne({'slack.name': id});
  if(member) return member;

  member = Members.findOne({'slack.id': id});
  if(member) return member;

  member = Members.findOne(id);
  if(member) return member;
};

isGuest = function(id) {
  var m = member(id);
  return m && m.slack.is_restricted;
};

updateSlackMembers = function () {
  console.log('*** Updating the slack members...');
  try {
    var data = slackApi('users.list');
    _.each(data.members, function(slackMember) {

      var m = Members.findOne({ 'slack.id': slackMember.id });
      if(m) {
        Members.update(m._id, { $set: { slack: slackMember } }, function (error, result) {
          if(error) {
            console.error('error while updateing a member', error, result);
            console.log('member', m);
            console.log('slack', slackMember);
          }
        });
      } else {
        Members.insert({ slack: slackMember }, function (error, result) {
          if(error) {
            console.error('error while inserting new member', error, result);
            console.log('member', m);
            console.log('slack', slackMember);
          }
        });
      }
    });
  } catch (e) {
    console.error('Cannot update slack members:', e);
  }
  console.log('Done');
};

Meteor.startup(function () {

  // delete users that have id different than the memberid (they'll have to relog to get the good one)
  Meteor.users.find().forEach(function(u) {
    if(u.services && u.services.slack && u.services.slack.id) {
      var m = Members.findOne({'slack.id': u.services.slack.id});
      if(m && m._id != u._id) {
        console.log('remove userid', m.slack.real_name, u._id, m._id);
        Meteor.users.remove(u._id);
      }
    }

  });
});
