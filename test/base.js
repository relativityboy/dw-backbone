var Base      = require('../src/base');
var expect    = require("chai").expect;
var _         = require('underscore');

var strfiy = function(obj) {
  return JSON.stringify(obj, null, '  ');
}

describe('Base', function() {
  describe("Utility functions", function() {
    describe(".isA", function() {
      it("exists", function() {
        expect(typeof Base.isA).to.equal('function')
      });
      it("returns classic types", function() {
        var undef;
        var types = {
          'object':{},
          'function':function(){},
          'string':'',
          'number':1,
          'boolean':true,
          'undefined':undef
        };
        _.each(types, function(val, key){
          expect(Base.isA(val)).to.equal(key);
        });
      });
      it("returns extended types", function() {
        var undef;
        var types = {
          'array':[],
          'NaN':1/'q',
          'null':null,
          'date':new Date()
        };
        _.each(types, function(val, key){
          expect(Base.isA(val)).to.equal(key);
        });
      });
    });
    describe(".deepClone", function() {
      it("exists", function() {
        expect(typeof Base.deepClone).to.equal('function');
      });
      it("clones a simple object", function() {
        var obj1 = {};
        var obj2 = Base.deepClone(obj1);
        var differentObjects = obj2 !== obj1;
        expect(differentObjects).to.equal(true);
      });
      it("clones all the keys of the original object", function() {
        var undef,
          obj1 = {'a':1, 'b':2,'c':3},
          obj2 = Base.deepClone(obj1);
        _.each(obj1, function(val, key){
          expect(obj2.hasOwnProperty(key)? key : undef).to.equal(key); //a way of doing the test while creating a better error message.
          expect(val).to.equal(obj2[key]); //test to check the value
        });
      });
      it("clones arrays as arrays & objects as objects", function() {
        var undef,
          obj1 = {'a':[], 'b':{},'c':3},
          obj2 = Base.deepClone(obj1);
        _.each(obj1, function(val, key){
          expect(val.constructor).to.equal(obj2[key].constructor); //test to check the value
        });
      });
      it("preserves deep clone values", function() {
        var obj1 = {'a':[1,2,3], 'b':{'t':[],'q':'f'},'c':3},
          obj2 = Base.deepClone(obj1);
          expect(obj1).to.deep.equal(obj2);
      });
      it("makes separate instances of deep clone values", function() {
        var obj1 = {'a':[1,2,3], 'b':{'t':[],'q':'f'},'c':3},
          obj2 = Base.deepClone(obj1);
          expect(obj1.a).to.not.equal(obj2.a);
          expect(obj1.b.t).to.not.equal(obj2.b.t);
      });

    });
    describe(".toCamel", function() {
      it("exists", function() {
        expect(typeof Base.toCamel).to.equal('function');
      });
      it("converts a simple string from under_score to camelCase", function() {
        expect(Base.toCamel('under_score')).to.equal('underScore');
      });
      it("converts a slightly more complex string from under_score to camelCase", function() {
        expect(Base.toCamel('under_score_again')).to.equal('underScoreAgain');
      });
      it("converts a slightly more complex string with double under__score__s to under_scored camel_Case", function() {
        expect(Base.toCamel('under__score__s')).to.equal('under_Score_S');
      });
      it("leaves already camelCased strings alone", function() {
        expect(Base.toCamel('camelCaseBuddy')).to.equal('camelCaseBuddy')
      });
      it("converts a hierarchical object with under_scored attributes into one with camelCased attributes", function() {
        var obj1 = {
          'apple_sauce':{
            'is_tasty':true,
            'bitter_bite':false
          },
          'grapefruit_juice':{
            'robert_farthing':['mimi_roark']
          }
        },
          obj2 = {
            'appleSauce':{
              'isTasty':true,
              'bitterBite':false
            },
            'grapefruitJuice':{
              'robertFarthing':['mimi_roark']
            }
          };
        expect(Base.toCamel(obj1)).to.deep.equal(obj2);
      });
      


    });
    describe(".toUnderscored", function() {
      it("exists", function() {
        expect(typeof Base.toUnderscored).to.equal('function');
      });
      it("converts camel case strings to underscored strings", function() {
        expect(Base.toUnderscored('camelCaseString')).to.equal('camel_case_string');
      });
      it("converts a hierarchical object with camelCased attributes into one with under_scored attributes", function() {
        var obj2 = {
            'apple_sauce':{
              'is_tasty':true,
              'bitter_bite':false
            },
            'grapefruit_juice':{
              'robert_farthing':['mimi_roark']
            }
          },
          obj1 = {
            'appleSauce':{
              'isTasty':true,
              'bitterBite':false
            },
            'grapefruitJuice':{
              'robertFarthing':['mimi_roark']
            }
          };
        expect(Base.toUnderscored(obj1)).to.deep.equal(obj2);
      });

    });
    describe(".stringify", function() {
      it("exists", function() {
        expect(typeof Base.stringify).to.equal('function');
      });
      it("is equivalent to JSON.stringify with indentation", function() {
        var obj1 = {
            'appleSauce':{
              'isTasty':true,
              'bitterBite':false
            },
            'grapefruitJuice':{
              'robertFarthing':['mimi_roark']
            }
          };
        expect(Base.stringify(obj1)).to.equal(JSON.stringify(obj1, null, '   '));
      });
    });
    describe(".logicallyIdentical", function() {
      var obj1, obj2;
      beforeEach(function() {
        obj1 = {
          'appleSauce':{
            'isTasty':true,
            'bitterBite':false
          },
          'grapefruitJuice':{
            'robertFarthing':['mimi_roark']
          }
        };
        obj2 = {
          'appleSauce':{
            'isTasty':true,
            'bitterBite':false
          },
          'grapefruitJuice':{
            'robertFarthing':['mimi_roark']
          }
        };
      });
      it("exists", function() {
        expect(typeof Base.logicallyIdentical).to.equal('function');
      });
      it("compares simple items for equality", function() {
        expect(Base.logicallyIdentical(1,1)).to.equal(true);
        expect(Base.logicallyIdentical('apple','apple')).to.equal(true);
        expect(Base.logicallyIdentical('pear','apple')).to.equal(false);

      });
      it("compares objects for logical equality", function() {
        expect(Base.logicallyIdentical({},{})).to.equal(true);
        //nested
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(true);
        obj2.grapefruitJuice = {
          robertFarthing:2
        };
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(false);
      });
      it("compares arrays of simple items for equality", function() {
        expect(Base.logicallyIdentical([1,2,3],[1,2,3])).to.equal(true);
        expect(Base.logicallyIdentical([1,2,3],[1,2])).to.equal(false);
        expect(Base.logicallyIdentical([1,3],[1,2,3])).to.equal(false);
        expect(Base.logicallyIdentical([2,1,3],[1,2,3])).to.equal(false);
      });
      it("compares arrays of nested objects for equality", function() {
        obj2.grapefruitJuice.loopl = [];
        expect(Base.logicallyIdentical([obj1,obj2],[obj1,obj2])).to.equal(true);
        expect(Base.logicallyIdentical([obj2,obj1],[obj1,obj2])).to.equal(false);
      });
    });
    describe(".cleanObject", function() {
      it("exists", function() {
        expect(typeof Base.cleanObject).to.equal('function');
      });
    });
    describe(".toUnderscoredJSONString", function() {
      it("exists", function() {
        expect(typeof Base.toUnderscoredJSONString).to.equal('function');
      });
    });
  });
});

