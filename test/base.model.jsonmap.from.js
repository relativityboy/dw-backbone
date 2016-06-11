var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');

describe("Base.Model.jsonMap.<mode>.from - transform input {...} on 'new Base.Model({...}, <mode>)'", function() {
  describe(".convert - global attribute name transformation",function(){
    var attributes, model, Model, undef;
    before(function() {
      Model = Base.Model.extend({
        jsonMaps:{
          underS:{
            from:{
              convert:'toUnderscored'
            }
          },
          camelC:{
            from:{
              convert:'toCamel'
            }
          }
        }
      });
    });
    beforeEach(function() {
      attributes = {
        b:1,
        c:'apple',
        objectOne:{
          'pear':'fruit',
          'banana':'more fruit'
        },
        object_two:{
          'pear':'glim',
          'banana':'grom'
        }
      };
    });
    it("= 'toUnderscored' converts camelCase arguments to under_scored",function(){
      model = new Model(attributes, 'underS');
      expect(model.attributes.hasOwnProperty('object_one')).to.equal(true);
    });
    it("= 'toCamel' converts under_scored arguments to camelCase",function(){
      model = new Model(attributes, 'camelC');
      expect(model.attributes.hasOwnProperty('objectTwo')).to.equal(true);
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