var Base      = require('../src/base');
var expect    = require("chai").expect;
var assert    = require("chai").assert;
var _         = require('underscore');

describe("Base.Model.dotPathIsChildTree=true - transform x.get/set('a.b.c') into x.get('a').get('b').get/set('c')", function() {
  describe(".set using dotPath (setting attributes on child models)",function(){
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
      });
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

  });

  describe(".get using dotPath (getting attributes on child models)", function() {
    var attributes, model, Model, ModelA, ModelB, CollectionA, cValue = "G", zValue = "H";
    before(function() {

      ModelB = Base.Model.extend({});
      ModelA = Base.Model.extend({
        _set:{
          b:ModelB
        }
      });
      CollectionA = Base.Collection.extend({
        model:ModelA
      });
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
    it("can get a regular attribute",function(){
      expect(model.get('a')).to.equal(model.attributes.a);
    });
    it("can get a child model's attribute",function(){
      expect(model.get('a.b')).to.equal(model.attributes.a.attributes.b);
    });
    it("can get a 2nd degree child model's attribute",function(){
      expect(model.get('a.b.c')).to.equal(model.attributes.a.attributes.b.attributes.c);
    });
    it("returns undefined if requested attribute is not set",function(){
      assert.typeOf(model.get('a.b.d'), 'undefined');
    });
    it("returns undefined if parent of requested attribute is not set",function(){
      assert.typeOf(model.get('a.c.d'), 'undefined');
    });
    it("throws an error if attempting to get the child of a raw object",function(){
      assert.throws(function() { model.get('x.y.z'); }, Error);
    });
  });

});