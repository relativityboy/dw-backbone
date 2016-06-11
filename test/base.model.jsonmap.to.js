var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');

describe("Base.Model.jsonMap.<mode>.to - transform .attributes of call to ModelInstance.toJSON(<mode>)", function() {
  describe(".convert - global attribute name transformation", function(){
    var attributes, model, Model, undef;
    before(function() {
      Model = Base.Model.extend({
        jsonMaps:{
          underS:{
            to:{
              convert:'toUnderscored'
            }
          },
          camelC:{
            to:{
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
      model = new Model(attributes);
    });
    it("= 'toUnderscored' converts camelCase attributes to under_scored", function(){
      expect(model.toJSON({},'underS').hasOwnProperty('object_one')).to.equal(true);
    });
    it("= 'toCamel' converts under_scored attributes to camelCase",function(){
      expect(model.toJSON({},'camelC').hasOwnProperty('objectTwo')).to.equal(true);
    });
  });

  describe(".exclude",function(){
    var attributes, model, Model, undef;
    before(function() {
      Model = Base.Model.extend({
        jsonMaps:{
          excl:{
            to:{
              exclude:['b','object_two', 'objectOne']
            }
          },
          incl:{
            to:{
              include:['objectOne']
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
      model = new Model(attributes);
    });
    it("keeps specified attributes from being added to the output json", function(){
      var json = model.toJSON('excl');
      var jsonTest = {c:'apple'};
      expect(json).to.deep.equal(jsonTest);
    });
  });
  describe(".include",function() {
    var attributes, model, Model, undef;
    before(function() {
      Model = Base.Model.extend({
        jsonMaps:{
          inclExcl:{
            to:{
              exclude:['b','object_two', 'objectOne'],
              include:['objectOne']
            }
          },
          incl:{
            to:{
              include:['objectOne']
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
      model = new Model(attributes);
    });
    it("allows only the specified attributes to be added to the output json", function () {
      var json = model.toJSON('incl');
      var jsonTest = {
        objectOne: {
          'pear': 'fruit',
          'banana': 'more fruit'
        }
      };
      expect(json).to.deep.equal(jsonTest);
    });
    it("if present, ignores .exclude",function(){
      var json = model.toJSON('inclExcl');
      var jsonTest = {
        objectOne: {
          'pear': 'fruit',
          'banana': 'more fruit'
        }
      };
      expect(json).to.deep.equal(jsonTest);
    });
  });

  describe(".attrs.<attrtName> - transforming specific attributes ",function(){
    it(".fieldName assigns attr <attrName> to value of fieldName",function(){
      var Model = Base.Model.extend({
        jsonMaps:{
          fld:{
            to: {
              attrs: {
                object_two: {
                  fieldName: 'fiddlyBumps'
                }
              }
            }
          }
        }
      });
      var modelJSON = (new Model(
        {
          object_two:{
            'pear':'glim',
            'banana':'grom'
          }
        }
      )).toJSON('fld')
      expect(modelJSON.hasOwnProperty('fiddlyBumps')).to.equal(true);
      expect(modelJSON.fiddlyBumps).to.deep.equal({'pear':'glim','banana':'grom'});
    });
    describe(".fn - transforming the value of an attribute", function(){
      var attributes, model, modelJSON, Model, undef, modelContextTest;
      before(function() {
        Model = Base.Model.extend({
          jsonMaps:{
            attr:{
              to: {
                attrs: {
                  object_two: {
                    fieldName: 'fiddlyBumps'
                  },
                  objectOne: {
                    fn: function (val) {
                      modelContextTest = this;
                      return _.keys(val);
                    }
                  },
                  jsonString1: {
                    fn: 'parse'
                  },
                  objectThree: {
                    fn: 'stringify'
                  }
                }
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
          },
          objectThree:{
            'orange':'tree',
            'grapefruit':'concord'
          },
          jsonString1:'{"a":1,"gross":"hot dog"}'
        };
        model = new Model(attributes);
        modelJSON = model.toJSON('attr');
      });
      it("= 'stringify' does JSON.stringify on the value",function(){
        expect(modelJSON.hasOwnProperty('objectThree')).to.equal(true);
        expect(typeof modelJSON.objectThree).to.equal('string');
        expect(modelJSON.objectThree).to.equal(JSON.stringify(attributes.objectThree));
      });
      it("= 'parse' does JSON.parse on the value",function(){
        expect(modelJSON.hasOwnProperty('objectThree')).to.equal(true);
        expect(typeof modelJSON.jsonString1).to.equal('object');
        expect(modelJSON.jsonString1).to.deep.equal({"a":1,"gross":"hot dog"});
      });
      it("= function() applies the function to the value",function(){
        expect(modelJSON.hasOwnProperty('objectOne')).to.equal(true);
        expect(typeof modelJSON.objectOne).to.equal('object');
        expect(modelJSON.objectOne.constructor).to.equal(Array);
        expect(modelJSON.objectOne).to.deep.equal(['pear','banana']);

      });
      it("= function() The context of the function is the Model",function(){
        expect(modelContextTest).to.equal(model);
      });
    });
  });
});
