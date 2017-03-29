var Base      = require('../src/base');
var expect    = require("chai").expect;
var assert    = require("chai").assert;
var _         = require('underscore');

describe("Base.Model.dotPathIsChildTree=true - transform x.get/set('a.b.c') into x.get('a').get('b').get/set('c')", function() {
  /*describe(".set on child Models",function(){
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
    it("throws an error if attempting to set the child of a raw object",function(){
      assert.throws(function() { model.set('x.y.z',newValue); }, Error);
    });
    it("throws an error if attempting to set anything within a collection\n   this test is to prove out that future collection functionality is not in place yet",function(){
      assert.throws(function() { model.set('aList.1.b.c',newValue); }, Error);

    });
  });*/
  describe(".set on Child Collections - speculative future functionality", function() {
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
            id:5,
            m:'4',
            b:{c:6}
          },{
            id:'z',
            m:'f',
            b:{c:1}
          },
          {
            id:'ll',
            m:'p',
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
    it("is a correct test model with collection",function(){
      expect(model.get('aList').get('ll').get('m')).to.equal('p');
      expect(model.get('aList').get('z').get('m')).to.equal('f');
      expect(model.get('aList').at(1).get('m')).to.equal('f');
      expect(model.get('x').y.z).to.equal(zValue);
    });
    it("can set a property on a model in a child collection where id is a string", function(){
      var updateValue1 = 'x', updateValue2 = 'apple';
      //first degree dotPath (attribute on a model in a collection)
      expect(model.get('aList').get('ll').get('m')).to.equal('p');
      model.set('aList.ll.m', updateValue1);

      expect(model.get('aList').get('ll').get('m')).to.equal(updateValue1);

      //second degree dotPath (attribute on a model's child model in a collection)
      expect(model.get('aList').get('ll').get('b').get('c')).to.equal(2);
      model.set('aList.ll.b.c', updateValue2);
      expect(model.get('aList').get('ll').get('m')).to.equal(updateValue1);
      expect(model.get('aList').get('ll').get('b').get('c')).to.equal(updateValue2);

      //make sure the above don't set attributes on the other models.
      expect(model.get('aList').get(5).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(model.get('aList').get('z').toJSON()).to.deep.equal(attributes.aList[1]);
    })
    it("can set a property on a model in a child collection where id is a number", function(){
      var updateValue1 = 'x';
      expect(model.get('aList').get(5).get('m')).to.equal('4');
      model.set('aList.5.m', updateValue1);
      expect(model.get('aList').get(5).get('m')).to.equal(updateValue1);
    });
    it("can set a property on a model in a child collection by order-index", function(){
      var updateValue1 = 'x';
      expect(model.get('aList').at(1).get('m')).to.equal('f');
      model.set('aList.[1].m', updateValue1);
      expect(model.get('aList').at(1).get('m')).to.equal(updateValue1);

      //make sure the above don't set attributes on the other models.
      expect(model.get('aList').at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(model.get('aList').at(2).toJSON()).to.deep.equal(attributes.aList[2]);
    });
    it("can set a property on all models in a child collection using [*]", function(){
      var updateValue1 = 'x';
      //test all models for their own values
      expect(model.get('aList').at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(model.get('aList').at(1).toJSON()).to.deep.equal(attributes.aList[1]);
      expect(model.get('aList').at(2).toJSON()).to.deep.equal(attributes.aList[2]);

      model.set('aList.[*].m', updateValue1);

      model.get('aList').each(function(mdl) {
        expect(mdl.get('m')).to.equal(updateValue1);
      });
    });
    it("can set a property on a child model of all models in a child collection using [*]", function(){
      var updateValue1 = 'x';
      //test all models for their own values
      expect(model.get('aList').at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(model.get('aList').at(1).toJSON()).to.deep.equal(attributes.aList[1]);
      expect(model.get('aList').at(2).toJSON()).to.deep.equal(attributes.aList[2]);

      model.set('aList.[*].b.c', updateValue1);

      model.get('aList').each(function(mdl) {
        expect(mdl.get('b').get('c')).to.equal(updateValue1);
      });
    });
  });

  describe(".get on child Collections - speculative future functionality", function() {
    it("stub - can get a property from a model in a child collection where id is a string", function(){})
    it("stub - can get a property from a model in a child collection where id is a number", function(){})
    it("stub - can get a property from a model in a child collection by order-index", function(){})
    it("stub - can get a property from all models in a child collection using [*]", function(){})
  });
});