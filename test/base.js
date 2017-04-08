var Base      = require('../src/base');
var expect    = require("chai").expect;
var assert    = require("chai").assert;
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
      it("returns true if second argument matches type", function() {
        var undef,
          types = {
          'object':{},
          'function':function(){},
          'string':'',
          'number':1,
          'boolean':true,
          'undefined':undef,
          'array':[],
          'NaN':1/'q',
          'null':null,
          'date':new Date()
        };
        _.each(types, function(val, key){
          expect(Base.isA(val, key)).to.equal(true);
        });
      });
      it("returns false if second argument does not match type", function() {
        var undef,
          types = {
            'object':{},
            'function':function(){},
            'string':'',
            'number':1,
            'boolean':true,
            'undefined':undef,
            'array':[],
            'NaN':1/'q',
            'null':null,
            'date':new Date()
          };
        _.each(types, function(val, key){
          expect(Base.isA(val, 'face')).to.not.equal(true);
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
          obj1 = {'a':1, 'b':2,'c':3, 'd':function(){return 'xyz'}},
          obj2 = Base.deepClone(obj1);
        _.each(obj1, function(val, key){
          expect(obj2.hasOwnProperty(key)? key : undef).to.equal(key); //a way of doing the test while creating a better error message.
          expect(val).to.equal(obj2[key]); //test to check the value
        });
      });
      it("Successfully clones 'this' if it is not passed something to clone", function() {
        var undef,
          obj1 = {'a':1, 'b':2,'c':3}, obj2;
        obj1.deepClone = Base.deepClone;
        obj2 = obj1.deepClone();
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
      it("does a simple _.clone for functions, strings, numbers", function() {
        var undef,
          str1 = 'gorp',
          str2,
          fn1 = function(){return 'xyz'},
          fn2;
        str1.a = [];
        str1.b = {};
        str1.c = 3;
        str2 = Base.deepClone(str1);
        _.each(str2, function(val, key){
          expect(val.constructor).to.equal(str1[key].constructor); //test to check the value
        });

        fn1.a = [];
        fn1.b = {};
        fn1.c = 3;
        fn2 = Base.deepClone(fn1);
        _.each(fn2, function(val, key){
          expect(val.constructor).to.equal(fn1[key].constructor); //test to check the value
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
      it("Successfully uses 'this' when not passed any arguments", function() {
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
            },
            toCamel:Base.toCamel //note, for this test, toCamel will clone a reference to itself on the new object!
          };
        obj1.toCamel = Base.toCamel;
        obj1 = obj1.toCamel();
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
      it("Successfully uses 'this' when not passed any arguments", function() {
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
        expect(Base.toUnderscored.call(obj1)).to.deep.equal(obj2);
      });
    });
    describe(".toUnderscoredJSONString", function() {
      it("exists", function() {
        expect(typeof Base.toUnderscoredJSONString).to.equal('function');
      });
      it("converts camel case strings to underscored strings", function() {
        expect(Base.toUnderscoredJSONString('camelCaseString')).to.equal('"camel_case_string"');
      });
      it("converts a hierarchical object with camelCased attributes into a pretty printed JSON string with under_scored attributes", function() {
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
        expect(Base.toUnderscoredJSONString(obj1)).to.equal('{\n   "apple_sauce": {\n      "is_tasty": true,\n      "bitter_bite": false\n   },\n   "grapefruit_juice": {\n      "robert_farthing": [\n         "mimi_roark"\n      ]\n   }\n}');
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
        obj1.grapefruitJuice = {
          robertFarthing:2
        };
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(true);
        obj1.grapefruitJuice = {};
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(false);

      });
      it("compares dates for logical equality", function() {
        obj1.adate = new Date();
        obj2.adate = new Date(obj1.adate.getTime());
        //obj2.adate.setTime();
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(true);
        obj1.adate.setTime(0);
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(false);
      });
      it("Treats NaN as equivalent", function() {
        obj1.nan = Math.sqrt(-1);
        obj2.nan = Math.sqrt(-1);
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(true);
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
      it("ignores attributes in a shallow ignoreTree", function() {
        obj1.a = 1;
        obj2.a = 2;
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(false);
        expect(Base.logicallyIdentical(obj1,obj2, {a:true})).to.equal(true);
      });
      it("ignores attributes in a deep ignoreTree", function() {
        obj1.appleSauce.isTasty = 'butter';
        expect(Base.logicallyIdentical(obj1,obj2)).to.equal(false);
        expect(Base.logicallyIdentical(obj1,obj2, {appleSauce:{isTasty:true}})).to.equal(true);
        obj1.grapefruitJuice.robertFarthing[0] = 'alpha';
        expect(Base.logicallyIdentical(obj1,obj2, {appleSauce:{isTasty:true},grapefruitJuice:{robertFarthing:true}})).to.equal(true);
      });
    });
    describe(".newMask", function() {
      it("exists", function() {
        expect(typeof Base.newMask).to.equal('function');
      });
      it("returns a clone of the first argument, missing the attributes specified in the second argument []", function() {
        var obj1 = {
          'truck':'stop',
          'appleSauce':{
            'isTasty':true,
            'bitterBite':false
          },
          'appleZnapple':{
            'isTasty':'gorm'
          },
          'grapefruitJuice':{
            'robertFarthing':['mimi_roark']
          },
          'grapeVegetableJuice':{
            'robertFarthing':['mimi_roark']
          }
        },
          remove = ['grapefruitJuice', 'truck'],
          keep = ['appleSauce','appleZnapple','grapeVegetableJuice'],
          obj2 = Base.newMask(obj1, remove);
        _.each(remove, function(key) {
          expect(obj2[key]).to.be.undefined;
        });

        _.each(keep, function(key) {
          expect(obj2[key]).to.deep.equal(obj1[key]);
        });
      });
    });
    describe(".cleanObject", function() {
      var obj1, obj2, keepArgument, keepValidation, remove;
      beforeEach(function() {
        obj1 = {
          'truck':'stop',
          'appleSauce':{
            'isTasty':'robert',
            'bitterBite':false
          },
          'appleZnapple':{
            'isTasty':'gorm'
          },
          'grapefruitJuice':{
            'robertFarthing':['mimi_roark'],
            'bombshell':{}
          },
          'grapeVegetableJuice':{
            'robertFarthing':['mimi_roark']
          }
        };
        remove = ['grapeVegetableJuice', 'appleZnapple'];
        keepArgument = {'appleSauce':{'isTasty':true},'truck':true, 'grapefruitJuice':true}
        keepValidation = {};
        keepValidation.appleSauce = _.clone(obj1.appleSauce);
        keepValidation.grapefruitJuice = _.clone(obj1.grapefruitJuice);
        keepValidation.truck = obj1.truck;
        delete keepValidation.appleSauce.bitterBite;

      });
      it("exists", function() {
        expect(typeof Base.cleanObject).to.equal('function');
      });
      it("returns a clone of the first argument, with only the attributes specified in the second argument", function() {
        obj2 = Base.cleanObject(obj1, keepArgument);
        _.each(remove, function(key) {
          expect(obj2[key]).to.be.undefined;
        });
        _.each(keepValidation, function(val, key) {
          expect(obj2[key]).to.be.ok;
          expect(JSON.stringify(obj2[key])).to.equal(JSON.stringify(keepValidation[key]));
        }, this);
      });
      it("clones an array, applying mask to each item in the array", function() {
        obj2 = _.clone(obj1);
        obj1 = [obj1, obj2]
        obj2 = Base.cleanObject(obj1, keepArgument);
        _.each(obj2, function(obj) {
          _.each(remove, function(key) {
            expect(obj[key]).to.be.undefined;
          });
        });
        _.each(obj2, function(obj) {
          _.each(keepValidation, function (val, key) {
            expect(obj[key]).to.be.ok;
            expect(JSON.stringify(obj[key])).to.equal(JSON.stringify(keepValidation[key]));
          }, this);
        });
      });
      it("throws an Error if exclude is passed", function() {
        assert.throws(function() { Base.cleanObject(obj1, keepArgument, true, true);}, Error);

      });
    });
    describe(".toUnderscoredJSONString", function() {
      it("exists", function() {
        expect(typeof Base.toUnderscoredJSONString).to.equal('function');
      });
    });
    describe(".setLooger & .getLogger", function() {
      it("sets and gets", function() {
        var fn = function(){};
        Base.setLogger(fn);
        expect(Base.getLogger() === fn).to.be.true;
      });
      it("call the passed in function on log events", function() {
        var logs = [],
          fn = function(msg){
            logs.push(msg);
          },
          model;

        Base.setLogger(fn);
        var Model = Base.Model.extend({
          _setCollections:{
            a:Base.Collection
          }
        });

        model = new Model({a:[{b:'c'}]});

        model.set('a', new Base.Collection([{b:'e'}]));

        expect(logs.length).to.equal(1);
      });
    });
  });
});

