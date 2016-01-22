clients = new Mongo.Collection('clients');
courses = new Mongo.Collection('courses');
collectors = new Mongo.Collection('collectors');

if (Meteor.isClient) {
  // counter starts at 0
  Template.create.helpers({
    data: function () {
      return Session.get('data');
    }
  });

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    courses: function() {
      return courses.find().fetch();
    }
  });

  Template.create.events({
    'submit form': function (event) {
      event.preventDefault();

      code = event.target.code.value;
      name = event.target.name.value;

      if(course = courses.findOne({ code:  code})) {
        courses.update({ _id: course._id }, {$set: {name: name, updatedAt: new Date()}});
      }else {
        courses.insert({ code: code, name: name, createdAt: new Date(), updatedAt: new Date() });
      }

      event.target.code.value = '';
      event.target.name.value = '';
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    },
    'click .update': function (event) {
      _id = event.target.dataset.id;
      Session.set('data', courses.findOne({ _id: _id}));
    },
    'click .delete': function (event) {
      _id = event.target.dataset.id;
      courses.remove({_id: _id});
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var publisher = Meteoris.Sync.Publisher.instance(collectors, clients);
    var method = Meteoris.Sync.Method.instance(collectors);

    publisher.register(courses, 'code');
    method.register(courses, 'code');

    publisher.publish();
    method.run();
  });
}
