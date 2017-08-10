var Backbone  = require('backbone');
var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');



describe('Base.Collection', function() {
  var Model, Collection, collection, errMap, keyMap, modelsJSON, modelJSON, counter, undef;
  before(function() {
    Model = Base.Model.extend({
      /*jsonMaps:{
        api:{
          from:{
            convert:'toCamel'
          },
          to:{
            convert:'toUnderscored'
          }
        }
      },*/
      incCounter:function() {
      counter++;
    }
    });

    Collection = Base.Collection.extend({
      model:Model
    });
  });
  beforeEach(function() {
    counter = 0;
    errMap = [];
    //keyMap = {'firstName':'first_name', 'lastName':'last_name', 'address':'address', 'city':'city'};
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
    }
    collection = new Collection(modelsJSON)
  });
  it("exists", function() {
    expect(typeof Base.Collection).to.equal('function')
  });
  it("is instantiable", function() {
    collection = new Base.Collection();
    expect(typeof collection).to.equal('object')
  });
  /*it("supports jsonMap Model constructor modes", function() {
    collection.each(function(model, i) {
      _.each(keyMap, function(val, key) {
        if(!model.attributes.hasOwnProperty(key)) {
          expect(key).to.equal(val);
        }
      });
    });
  });
  it(".toJSON supports jsonMap Model toJSON modes", function() {
    var jsonList = collection.toJSON('api');
    _.each(jsonList, function(json, i) {
      _.each(keyMap, function(val, key) {
        if(!json.hasOwnProperty(val)) {
          expect(val).to.equal(key);
        }
      });
    });
  });*/
  it(".setOnAll sets value on all models in collection", function() {
    collection.setOnAll('planet', 'earth');
    collection.each(function(model, i) {
      expect('earth').to.equal(model.attributes.planet);
    });
  });
  it(".callOnAll calls function on all models in collection", function() {
    collection.callOnAll('incCounter');
    expect(counter).to.equal(3)
  });
  it(".unsetOnAll unsets value on all models in collection", function() {
    collection.unsetOnAll('firstName');
    collection.each(function(model, i) {
      expect(model.get('firstName')).to.equal(undef);
    });
  });
});
