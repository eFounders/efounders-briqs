
$.material.options.autofill = false;
$.material.init();

Meteor.startup(function () {
  if(isProduction()) {
    console.log('production server, use the slack admin bool');
    var m = Members.findOne(Meteor.userId());
    return m && m.slack.is_admin;
  } else {
    console.log('dev env, everybody are admin');
    return true;
  }
});

Router.onBeforeAction(function () {
  if (!Meteor.user() && !Meteor.loggingIn())
    this.render('login');
  else
    this.next();
});

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
});

Router.route('/', {
  name: 'home',
  waitOn: function () {
    return [Meteor.subscribe('members'), Meteor.subscribe('briqLogs')];
  },
  data: function () {
    return {
      me: Members.findOne({ 'slack.id': Meteor.user() && Meteor.user().profile.user_id }),
      members: Members.find({}, { sort: { 'briqs.has': -1, 'slack.name': 1 } }),
      logs: BriqLogs.find({}, { sort: { createdAt: -1 } })
    };
  }
});

Template.home.events({
  'click #logout': function (e) {
    Meteor.logout();
  }
});

Template.home.helpers({
  date: function () {
    return moment(this.createdAt).fromNow();
  },

  from: function () {
    var member = Members.findOne(this.fromId);
    if(member) return member.slack.name;
    else return '<unknown>';
  },

  rank: function () {
    var m = this;
    if(m.briqs && m.briqs.has)
      return Members.find({ 'briqs.has': { $gte: m.briqs.has } }).count();
    return '-';
  },

  to: function () {
    var member = Members.findOne(this.toId);
    if(member) return member.slack.name;
    else return '<unknown>';
  },
});
