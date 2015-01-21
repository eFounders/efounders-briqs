
isAdmin = function(id) {
  if(isProduction()) {
    console.log('production server, use the slack admin bool');
    var m = member(id);
    return m && m.slack.is_admin;
  } else {
    console.log('dev env, everybody are admin');
    return true;
  }
};

Accounts.validateNewUser(function (user) {
  var m = member(user._id);

  if (m && !m.slack.is_restricted && user.profile && user.profile.team_id === 'T029MPGH6')
    return true;
  throw new Meteor.Error(403, "You must be a member of The Network to log in");
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
    console.log('TheNetwork is launched in production mode');
  else
    console.log('DEV MODE, everybody are admin');
});
