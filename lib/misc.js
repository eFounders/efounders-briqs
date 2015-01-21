
isProduction = function () {
  return Meteor.settings && Meteor.settings.public && Meteor.settings.public.production;
};
