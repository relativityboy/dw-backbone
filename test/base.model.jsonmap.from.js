var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');

describe("Base.Model.jsonMap.<mode>.from - transform input {...} on 'new Base.Model({...}, <mode>)'", function() {
  describe(".convert - global attribute name transformation",function(){
    var attributes, model, Model;
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
  describe(".exclude", function() {
    it("keeps specified attributes from being added to the model",function(){
      var Model = Base.Model.extend({
        jsonMaps:{
          excl:{
            from:{
              exclude:['objectOne', 'object_two', 'a']
            }
          }
        }
      });
      var model = new Model({
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
      }, 'excl');
      expect(model.attributes.hasOwnProperty('object_two')).to.equal(false);
      expect(model.attributes.hasOwnProperty('objectOne')).to.equal(false);
      expect(model.attributes.hasOwnProperty('c')).to.equal(true);
      expect(model.attributes.hasOwnProperty('b')).to.equal(true);
    });
  });
  describe(".include", function() {
    var attributes, model, Model;
    before(function() {
      Model = Base.Model.extend({
        jsonMaps:{
          incl:{
            from:{
              include:['object_two', 'c']
            }
          },
          inclExcl:{
            from:{
              include:['objectOne'],
              exclude:['objectOne', 'object_two', 'a']
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
    it("allows only the specified attributes to be added to the model",function(){
      model = new Model(attributes, 'incl');
      expect(model.attributes.hasOwnProperty('object_two')).to.equal(true);
      expect(model.attributes.hasOwnProperty('c')).to.equal(true);
      expect(model.attributes.hasOwnProperty('objectOne')).to.equal(false);
      expect(model.attributes.hasOwnProperty('b')).to.equal(false);
    });
    it("with .exclude also specced ignores .exclude",function(){
      model = new Model(attributes, 'inclExcl');
      expect(model.attributes.hasOwnProperty('object_two')).to.equal(false);
      expect(model.attributes.hasOwnProperty('c')).to.equal(false);
      expect(model.attributes.hasOwnProperty('objectOne')).to.equal(true);
      expect(model.attributes.hasOwnProperty('b')).to.equal(false);
    });
  });
  describe(".inputs.<inputName> - transforming specific attributes ",function(){
    var attributes, model, thisModel, Model;
    before(function() {
      Model = Base.Model.extend({
        jsonMaps:{
          inputName:{
            from:{
              inputs:{
                objectOne:{
                  attrName:'goober'
                }
              }
            }
          },
          funct:{
            from:{
              inputs:{
                object_two:{
                  fn:'stringify'
                },
                jsonString1:{
                  fn:'parse'
                },
                c:{
                  fn:function() {
                    thisModel = this;
                    return 'robot';
                  }
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
        jsonString1:'{"a":1,"gross":"hot dog"}'
      };
    });
    it(".attrName assigns attr <inputName> to value of attrName",function(){
      model = new Model(attributes, 'inputName');
      expect(model.attributes.hasOwnProperty('objectOne')).to.equal(false);
      expect(model.attributes.hasOwnProperty('goober')).to.equal(true);
    });
    it(".fn = 'stringify' does JSON.stringify on the value",function(){
      model = new Model(attributes, 'funct');
      expect(typeof model.attributes.object_two).to.equal('string');

    });
    it(".fn = 'parse' does JSON.parse on the value",function(){
      model = new Model(attributes, 'funct');
      expect(typeof model.attributes.jsonString1).to.equal('object');
      expect(model.attributes.jsonString1).to.deep.equal({"a":1,"gross":"hot dog"});
    });
    it(".fn = function() applies the function to the value",function(){
      model = new Model(attributes, 'funct');
      expect(model.attributes.c).to.equal('robot');
    });
    it(".fn = function() - The context of the function is the Model",function(){
      model = new Model(attributes, 'funct');
      expect(model).to.equal(thisModel);
    });
  });
  describe("jsonMap._.from automatically used if present and no mode is passed to the constructor", function() {
    it("stub", function(){})
  });
});