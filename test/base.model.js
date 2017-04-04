var Backbone  = require('backbone');
var Base      = require('../src/base');
var expect    = require("chai").expect;
var assert    = require("chai").assert;
var _         = require('underscore');



describe('Base.Model', function() {
  it("exists", function() {
    expect(typeof Base.Model).to.equal('function')
  });
  it("is instantiable", function() {
    var model = new Base.Model();
    expect(typeof model).to.equal('object')
  });
  describe('simple new Base.Model() features', function() {
    var attributes, model;
    before(function() {
      var Model = Base.Model.extend({
        _setCollections:{
          collection:Backbone.Collection
        }
      });
      attributes = {'attribute_one':'1', 'attribute_two':'2', 'collection':[{id:1, name:'apple'}, {id:2, name:'pear'}]};
      model = new Model(attributes);
    });
    it("preserves passed in attributes on construct", function() {
      expect(_.keys[model.attributes]).to.deep.equal(_.keys[attributes]);
    });
    it("creates collections described in ._setCollections on on construct", function() {
      expect(model.attributes.collection.constructor).to.deep.equal(Backbone.Collection);
    });
    it("preserves collections described in ._setCollections on set", function() {
      model.set('collection', {id:3, name:'grapefruit'});
      expect(model.attributes.collection.constructor).to.deep.equal(Backbone.Collection);
      expect(model.get('collection').get(3).constructor).to.equal(Backbone.Model)
    });
  });

  describe(".set functionality", function() {
    var attributes, model, Model, Model2, undef, ModelAttribute, Collection;
    before(function() {
      ModelAttribute = Base.Model.extend({});
      Collection = Backbone.Collection.extend({model:Backbone.Model.extend({idAttribute:'id'})})
      Model = Base.Model.extend({
        _setCollections:{
          collection:Collection
        },
        _set:{
          'a':function(val) {
            if(val) {
              return true;
            }
            return false;
          },
          'collection':function(val) {
            if(val.constructor !== Array) {
              val = [val]
            }
            _.each(val, function(v, i) {
              if(typeof v == 'string') {
                val[i] = {id:1, 'name':v}
              }
            })

            return val;
          },
          'l':ModelAttribute
        }
      });
      Model2 = Base.Model.extend({
        _setCollections: {
          collection: Collection
        }
      });
    });
    beforeEach(function() {
      model = new Model({});
    });
    it("modelInstance.set('parentModel', ParentModel) to modelInstance.parentModel", function() {
      var parentModel = new Base.Model();
      model.set('parentModel',parentModel);
      expect(parentModel).to.equal(model.parentModel);
    });
    it("on set different parentModel, child model is removed from parentModel._childModels", function() {
      var parentModel = new Base.Model();
      model.set('id', 11);
      model.set('parentModel',parentModel);
      expect(model).to.equal(parentModel._childModels.get(11));

      model.set('parentModel',new Backbone.Model());
      expect(parentModel._childModels.get(11)).to.equal(undef);
    });
    it("uses _set.<attrName> on set for attribute transformation", function() {
      expect(model.get('a')).to.equal(undef);
      model.set('a', 0);
      expect(model.get('a')).to.equal(false);
      model.set('a', new Date());
      expect(model.get('a')).to.equal(true);
      var date = new Date();
      model.set('b', date);
      expect(model.get('b')).to.equal(date);
    });
    it("uses _set.<attrName> when instanceof Backbone.Model on set for child model instantiation", function() {
      var modelAttribute, modelAttributeJSON = {'bork':'zork'};
      expect(model.get('l')).to.equal(undef);
      model.set('l', modelAttributeJSON);
      expect(model.get('l')).to.not.equal(modelAttributeJSON);
      expect(model.get('l')).to.be.an.instanceof(ModelAttribute);
      modelAttribute = model.get('l');
      model.set('l', modelAttributeJSON);
      expect(model.get('l')).to.not.equal(modelAttribute);
      model.set('l', modelAttribute);
      expect(model.get('l')).to.equal(modelAttribute);
    });

    it("removes attribute when it's destroyed IF attribute is instanceof Backbone.Model & was instantiated by _set.<attrName>", function() {
      var modelAttribute, modelAttributeJSON = {'bork':'zork'};
      //removed on dispose()
      model.set('l', modelAttributeJSON);
      modelAttribute = model.get('l');
      modelAttribute.dispose(); //trigger the delete event
      expect(model.get('l')).to.equal(undef);

      //removed on destroy()
      model.set('l', modelAttributeJSON);
      modelAttribute = model.get('l');
      modelAttribute.destroy(); //trigger the delete event
      expect(model.get('l')).to.equal(undef);

      //removed even if child model is created outside of ._set, so long as attribute type is declared in ._set
      model.set('l', new ModelAttribute(modelAttributeJSON));
      modelAttribute = model.get('l');
      modelAttribute.destroy(); //trigger the delete event
      expect(model.get('l')).to.equal(undef);

      //not removed if attribute's type is not declared in ._set
      model.set('qq', new ModelAttribute(modelAttributeJSON));
      modelAttribute = model.get('qq');
      modelAttribute.destroy(); //trigger the delete event
      expect(model.get('qq')).to.equal(modelAttribute);
    });
    it("uses _set.<attrName> in conjunction with _setCollection", function() {
      expect(model.get('collection')).to.equal(undef);
      model.set('collection', "grom");
      expect(model.get('collection').length).to.equal(1);
      expect(model.get('collection').at(0).get('name')).to.equal('grom');

      model.set('collection', {id:2, 'boo':3});
      expect(model.get('collection').length).to.equal(1);

      model.set('collection', ["grom", {id:2, 'boo':3}]);
      expect(model.get('collection').length).to.equal(2);
    });

    it("manages self created collection as defined by _setCollection", function() {
      var model = new Model2({collection:[{id:2, 'boo':3}]}),
        collection = new Collection([{id:7, 'boo':8}]);

      expect(model.get('collection').length).to.equal(1);

      //test
      model.set('collection', collection);

      //original collection should be preserved, not replaced
      expect(model.get('collection')).to.not.equal(collection);

      //because ids are different, classic backbone 'set' behavior observed (remove models not present in passed list)
      expect(model.get('collection').length).to.equal(1);
      //actual models from passed-in collection are put into collection attached to model (this helps keep any event listeners from getting destroyed)
      expect(model.get('collection').at(0)).to.equal(collection.at(0));
    });
  });
  describe(".logicallyIdentical", function() {
    var model1, model2, model3;
    beforeEach(function () {
      var fnObj1 = function() {
        return {
          id:1,
          'appleSauce': {
            'isTasty': true,
            'bitterBite': false
          },
          'grapefruitJuice': {
            'robertFarthing': ['mimi_roark']
          }
        };
      };

      var fnObj2 = function() {
        return {
          id:3,
          'appleSauce': {
            'isTasty': true,
            'bitterBite': false
          },
          'grapefruitJuice': {
            'robertFarthing': ['mimi_roark', 'joan']
          }
        };
      };
      model1 = new Base.Model(fnObj1());
      model2 = new Base.Model(fnObj1());
      model3 = new Base.Model(fnObj2());
    });
    it("exists", function() {
      expect(typeof model1.logicallyIdentical).to.equal('function');
    });
    it("compares models for perfect attribute equality", function() {
      expect(model1.logicallyIdentical(model2)).to.equal(true);
    });

    it("compares models for attribute equality except id", function() {
      model2.set('id', 11);
      expect(model1.logicallyIdentical(model2, true)).to.equal(true);
    });
  });
  describe(".toJSON", function() {
    var attributes, model, Model, undef;
    before(function() {
      Model = Base.Model.extend({});
    });
    beforeEach(function() {
      attributes = {
        b:1,
        c:'apple',
        object:{
          'pear':'fruit',
          'banana':'more fruit'
        }
      };
      model = new Model(attributes);
    });
    it("simple toJSON matches attributes structure", function() {
      expect(JSON.stringify(model.toJSON())).to.equal(JSON.stringify(attributes));
    });
    it("simple toJSON  attributes are deep cloned", function() {
      expect(model.toJSON().object).to.not.equal(attributes.object);
    });
    it("calls .toJSON on child attributes if they implement it", function() {
      model.set('model', new Base.Model(attributes.object));
      var json = model.toJSON();
      //the following check validates that the structure of both objects is the same.
      //if .toJSON weren't called .model would be an instance of Base.Model
      expect(json.object).to.deep.equal(json.model);
    });
    it("Throws error if invalid toJSON mode specified", function() {
      assert.throws(function() { model.toJSON('xx');}, Error);

    });
  });

  
});
