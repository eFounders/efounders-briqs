
isAdmin = function(id) {
  if(isProduction()) {
    var m = member(id);
    return m && m.slack.is_admin;
  } else {
    return true;
  }
};

Accounts.validateNewUser(function (user) {
  var m = member(user._id);

  if (m && !m.slack.is_restricted && user.profile && user.profile.team_id === Meteor.settings.slackTeamId)
    return true;
  throw new Meteor.Error(403, 'You must be a member of the team to log in to Slack');
});

Accounts.onCreateUser(function(options, user) {
  updateSlackMembers();

  // if we find a member related to this user, use the same _id
  if(user && user.services && user.services.slack && user.services.slack.id) {
    var member = Members.findOne({'slack.id': user.services.slack.id});
    if(member) {
      user._id = member._id;
    }
  }
  if (options.profile)
    user.profile = options.profile;
  return user;
});


Meteor.startup(function () {
  if(isProduction())
    console.log('Server is launched in production mode');
  else
    console.log('DEV MODE, everybody are admin');
});
