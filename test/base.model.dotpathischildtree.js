var Base      = require('../src/base');
var expect    = require("chai").expect;
var assert    = require("chai").assert;
var _         = require('underscore');

describe("Base.Model.dotPathIsChildTree=true - transform x.get/set('a.b.c') into x.get('a').get('b').get/set('c')", function() {
  describe(".set on child Models",function(){
    var attributes, model, Model, ModelA, ModelB, CollectionA, cValue = "G", newValue = "Y", zValue = "H";
    before(function() {

      ModelB = Base.Model.extend({});
      ModelA = Base.Model.extend({
        _set:{
          b:ModelB
        }
      });
      CollectionA = Base.Collection.extend({
        model:ModelA
      })
      Model = Base.Model.extend({
        _set:{
          a:ModelA
        },
        _setCollections:{
          aList:CollectionA
        }
      });
    });
    beforeEach(function() {
      attributes = {
        a:{
          b:{
            c:cValue
          }
        },
        aList:[
          {
            id:'1',
            b:{c:1}
          },
          {
            id:'2',
            b:{c:2}
          }
        ],
        x:{
          y:{
            z:zValue
          }
        }
      };
      model = new Model(attributes);
    });
    it("is a correct test model",function(){
      expect(model.get('a').get('b').get('c')).to.equal(cValue);
      expect(model.get('x').y.z).to.equal(zValue);
    });
    it("can set c via model.set('a.b.c', <val>)",function(){
      model.set('a.b.c',newValue);
      expect(model.get('a').get('b').get('c')).to.equal(newValue);
    });

    it("classic model updates happen before dotPath updates",function(){
      var aModel = model.get('a');
      model.set({
        a:{
          b:{
            c:'QQ'
          }
        },
        'a.b.c':newValue
      });

      expect(model.get('a').get('b').get('c')).to.equal(newValue);
      expect(aModel.get('b').get('c')).to.equal(cValue);
      expect(aModel).to.not.equal(model.get('a'));
    });
    it("object passed to .set is not modified (side effects of that sort are bad!)",function(){
      var attrs = {
          'a.b.c':newValue,
          'm':'pqr'
        },
        attrs2 = _.clone(attrs);
      //make sure they're not the same object
      expect(attrs).to.not.equal(attrs2);
      //make sure they're logically equivalent.
      expect(JSON.stringify(attrs)).to.equal(JSON.stringify(attrs2));
      model.set(attrs);
      //make sure the values got set (not needed but nice to be sure)
      expect(model.get('a').get('b').get('c')).to.equal(newValue);
      expect(model.get('m')).to.equal('pqr');

      //and the money test. Are these two still logically equivalent?
      expect(JSON.stringify(attrs)).to.equal(JSON.stringify(attrs2));
    });
    it("throws an error if attempting to set the child of a raw object",function(){
      assert.throws(function() { model.set('x.y.z',newValue); }, Error);
    });
    it("throws an error if attempting to set anything within a collection\n   this test is to prove out that future collection functionality is not in place yet",function(){
      assert.throws(function() { model.set('aList.1.b.c',newValue); }, Error);

    });
  });
  describe(".set on Child Collections - speculative future functionality", function() {
    it("stub - can set a property on a model in a child collection where id is a string", function(){})
    it("stub - can set a property on a model in a child collection where id is a number", function(){})
    it("stub - can set a property on a model in a child collection by order-index", function(){})
    it("stub - can set a property on all models in a child collection using [*]", function(){})
  });
  describe(".get on child Models - speculative future functionality", function() {
    it("stub - throws an error if attempting to get the child of a raw object",function(){})
  });
  describe(".get on child Collections - speculative future functionality", function() {
    it("stub - can get a property from a model in a child collection where id is a string", function(){})
    it("stub - can get a property from a model in a child collection where id is a number", function(){})
    it("stub - can get a property from a model in a child collection by order-index", function(){})
    it("stub - can get a property from all models in a child collection using [*]", function(){})
  });
});