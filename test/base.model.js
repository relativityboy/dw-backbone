var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');

var Model = Base.Model;

describe('Base.Model', function() {
  it("exists", function() {
    expect(typeof Base.Model).to.equal('function')
  });
  it("is instantiable", function() {
    var model = new Base.Model();
    expect(typeof model).to.equal('object')
  });
  describe("preserves passed in attributes on construct", function() {
    it("test stub", function(){});
  });
  describe("creates collections described in ._setCollections on onconstruct", function() {
    it("test stub", function(){});
  });
  describe("preserves collections described in ._setCollections on set", function() {
    it("test stub", function(){});
  });
  describe(".set functionality", function() {

    describe("modelInstance.set('parentModel', ParentModel) to modelInstance.parentModel", function() {
      it("test stub", function(){});
    });
    describe("modelInstance.set('parentModel', ParentModel) to ParentModel._childModels.add(modelInstance)", function() {
      it("test stub", function(){});
    });
    describe("uses _set.<attrName> on set for attribute transformation", function() {
      it("test stub", function(){});
    });
    describe("uses _set.<attrName> on set for attribute transformation", function() {
      it("test stub", function(){});
    });
  });
  describe(".toJSON clones the object to POJO as expected", function() {
    it("test stub", function(){});
  });
  describe(".toJSON calls .toJSON on child attributes if they possess that attribute only if it is a function", function() {
    it("test stub", function(){});
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
