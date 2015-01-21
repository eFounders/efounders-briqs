
Schemas.Briq = new SimpleSchema({
  has: {
    type: Number,
    defaultValue: 0,
  },
  canGive: {
    type: Number,
    defaultValue: 0,
  },
  gave: {
    type: Number,
    defaultValue: 0,
  },
});

Schemas.Member = new SimpleSchema({
  briqs: {
    type: Schemas.Briq
  },
  slack: {
    type: Object,
    blackbox: true
  },
});

Members = new Mongo.Collection('members');
Members.attachSchema(Schemas.Member);

