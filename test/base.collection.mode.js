var Backbone  = require('backbone');
var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');



describe('Base.Collection - Model.jsonMap support', function() {
  var Model, ModelImplicit, Collection, CollectionImplicit,  collection, errMap, keyMap, modelsJSON, modelJSON, counter, undef;
  before(function() {
    Model = Base.Model.extend({
      jsonMaps:{
        api:{
          from:{
            convert:'toCamel'
          },
          to:{
            convert:'toUnderscored'
          }
        }
      },
      incCounter:function() {
      counter++;
    }
    });

    ModelImplicit = Base.Model.extend({
      jsonMaps:{
        _:{
          from:{
            convert:'toCamel'
          },
          to:{
            convert:'toUnderscored'
          }
        }
      },
      incCounter:function() {
        counter++;
      }
    });

    Collection = Base.Collection.extend({
      model:Model
    });
    CollectionImplicit = Base.Collection.extend({
      model:ModelImplicit
    });
  });
  beforeEach(function() {
    counter = 0;
    errMap = [];
    keyMap = {'firstName':'first_name', 'lastName':'last_name', 'address':'address', 'city':'city'};
    modelsJSON = [
      {
        first_name:'George',
        last_name:'Menlow',
        address:'1785 Thurston St',
        city:'VanCouver'
      },
      {
        first_name:'Obama',
        last_name:'Barack',
        address:'1700 Whitehouse St.',
        city:'Washington'
      },
      {
        first_name:'Arnold ',
        last_name:'Schwartzenwhatever',
        address:'Hummer Drive',
        city:'Calicopia'
      }
    ];

    modelJSON = {
      first_name:'David',
      last_name:'Attenborough',
      address:'Staged Authenticity',
      city:'Tree Town'
    };
  });
  it("supports jsonMap Model constructor EXPLICIT modes", function() {
    collection = new Collection(modelsJSON, 'api');

    collection.each(function(model, i) {
      _.each(keyMap, function(val, key) {
        if(!model.attributes.hasOwnProperty(key)) {
          expect(key).to.equal(val); //this is an error trigger. We're just checking attribute name transform here
        }
      });
    });
  });
  it(".toJSON supports jsonMap Model toJSON EXPLICIT modes", function() {
    collection = new Collection(modelsJSON, 'api');
    var jsonList = collection.toJSON('api');
    _.each(jsonList, function(json, i) {
      _.each(keyMap, function(val, key) {
        if(!json.hasOwnProperty(val)) {
          expect(val).to.equal(key); //this is an error trigger. We're just checking attribute name transform here
        }
      });
    });
  });
  it("supports jsonMap Model constructor IMPLICIT mode", function() {
    collection = new CollectionImplicit(modelsJSON);

    collection.each(function(model, i) {
      _.each(keyMap, function(val, key) {
        if(!model.attributes.hasOwnProperty(key)) {
          expect(key).to.equal(val); //this is an error trigger. We're just checking attribute name transform here
        }
      });
    });
  });
  it(".toJSON supports jsonMap Model toJSON IMPLICIT mode", function() {
    collection = new CollectionImplicit(modelsJSON);
    var jsonList = collection.toJSON();
    console.log(JSON.stringify(jsonList, null, 2));
    _.each(jsonList, function(json, i) {
      _.each(keyMap, function(val, key) {
        if(!json.hasOwnProperty(val)) {
          expect(val).to.equal(key);
        }
      });
    });
  });
});
