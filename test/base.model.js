var Backbone  = require('backbone');
var Base      = require('../src/base');
var expect    = require("chai").expect;
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
    var attributes, model, Model, undef;
    before(function() {
      Model = Base.Model.extend({
        _set:{
          'a':function(val) {
            if(val) {
              return true;
            }
            return false;
          }
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
    it("on set parentModel, _childModels is set only if it exists", function() {
      var parentModel = new Base.Model();
      model.set('parentModel',parentModel);
      expect(model).to.equal(parentModel._childModels.at(0));

      parentModel = new Backbone.Model();
      model.set('parentModel',parentModel);
      expect(parentModel.hasOwnProperty('_childModels')).to.equal(false);
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
  });

  describe(".jsonMap.<mode>.from - transform input {...} on 'new Base.Model({...}, <mode>)'", function() {
    describe(".convert - global attribute name transformation",function(){
      describe("= 'toUnderscored' converts camelCase arguments to under_scored",function(){
        it("test stub", function(){});
      });
      describe("= 'toCamel' converts under_scored arguments to camelCase",function(){
        it("test stub", function(){});
      });
    });

    describe(".exclude keeps specified attributes from being added to the model",function(){
      it("test stub", function(){});
    });
    describe(".include allows only the specified attributes from being added to the model",function(){
      it("test stub", function(){});
    });
    describe(".include with .exclude also specced ignores .exclude",function(){
      it("test stub", function(){});
    });
    describe(".inputs.<inputName> - transforming specific attributes ",function(){
      describe(".attrName assigns attr <inputName> to value of attrName",function(){
        it("test stub", function(){});
      });
      describe(".fn - transforming the value of an attribute", function(){
        describe("= 'stringify' does JSON.stringify on the value",function(){
          it("test stub", function(){});
        });
        describe("= 'parse' does JSON.parse on the value",function(){
          it("test stub", function(){});
        });
        describe("= function()",function(){
          describe("applies the function to the value",function(){
            it("test stub", function(){});
          });
          describe("The context of the function is the Model",function(){
            it("test stub", function(){});
          });
        });
      });
    });
  });

  describe(".jsonMap.<mode>.to - transform .attributes of call to ModelInstance.toJSON(null, <mode>)", function() {
    describe(".convert - global attribute name transformation",function(){
      describe("= 'toUnderscored' converts camelCase attributes to under_scored",function(){
        it("test stub", function(){});
      });
      describe("= 'toCamel' converts under_scored attributes to camelCase",function(){
        it("test stub", function(){});
      });
    });

    describe(".exclude keeps specified attributes from being added to the output json",function(){
      it("test stub", function(){});
    });
    describe(".include allows only the specified attributes to be added to the output json",function(){
      it("test stub", function(){});
    });
    describe(".include with .exclude also specced ignores .exclude",function(){
      it("test stub", function(){});
    });
    describe(".attrs.<attrtName> - transforming specific attributes ",function(){
      describe(".fieldName assigns attr <attrName> to value of attrName",function(){
        it("test stub", function(){});
      });
      describe(".fn - transforming the value of an attribute", function(){
        describe("= 'stringify' does JSON.stringify on the value",function(){
          it("test stub", function(){});
        });
        describe("= 'parse' does JSON.parse on the value",function(){
          it("test stub", function(){});
        });
        describe("= function()",function(){
          describe("applies the function to the value",function(){
            it("test stub", function(){});
          });
          describe("The context of the function is the Model",function(){
            it("test stub", function(){});
          });
        });
      });
    });
  });

});
