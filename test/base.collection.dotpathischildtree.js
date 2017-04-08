var Base      = require('../src/base');
var expect    = require("chai").expect;
var assert    = require("chai").assert;
var _         = require('underscore');

describe("Base.Model.dotPathIsChildTree=true - transform x.get/set('a.b.c') into x.get('a').get('b').get/set('c')", function() {

  describe(".set on Child Collections - ", function() {
    var aList, attributes, model, Model, ModelA, ModelB, CollectionA, cValue = "G", newValue = "Y", zValue = "H";
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
      aList = new CollectionA(attributes.aList);
    });
    it("is a correct test model with collection & collection",function(){
      expect(model.get('aList').get('ll').get('m')).to.equal('p');
      expect(model.get('aList').get('z').get('m')).to.equal('f');
      expect(model.get('aList').at(1).get('m')).to.equal('f');
      expect(model.get('x').y.z).to.equal(zValue);


      expect(aList.get('ll').get('m')).to.equal('p');
      expect(aList.get('z').get('m')).to.equal('f');
      expect(aList.at(1).get('m')).to.equal('f');
    });

    it("can set a property on a model in a collection where id is a string", function(){
      var updateValue1 = 'x', updateValue2 = 'apple';
      //first degree dotPath (attribute on a model in a collection)
      expect(aList.get('ll').get('m')).to.equal('p');
      aList.setOn('ll.m', updateValue1);

      expect(aList.get('ll').get('m')).to.equal(updateValue1);

      //second degree dotPath (attribute on a model's child model in a collection)
      expect(aList.get('ll').get('b').get('c')).to.equal(2);
      aList.setOn('ll.b.c', updateValue2);
      expect(aList.get('ll').get('m')).to.equal(updateValue1);
      expect(aList.get('ll').get('b').get('c')).to.equal(updateValue2);

      //make sure the above don't set attributes on the other models.
      expect(aList.get(5).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(aList.get('z').toJSON()).to.deep.equal(attributes.aList[1]);
    })
    it("can set a property on a model in a collection where id is a number", function(){
      var updateValue1 = 'x';
      expect(aList.get(5).get('m')).to.equal('4');
      aList.setOn('5.m', updateValue1);
      expect(aList.get(5).get('m')).to.equal(updateValue1);
    });
    it("can set a property on a model in a collection by order-index", function(){
      var updateValue1 = 'x';
      expect(aList.at(1).get('m')).to.equal('f');
      aList.setOn('[1].m', updateValue1);
      expect(aList.at(1).get('m')).to.equal(updateValue1);

      //make sure the above don't set attributes on the other models.
      expect(aList.at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(aList.at(2).toJSON()).to.deep.equal(attributes.aList[2]);
    });
    it("can set a property on all models in a collection using [*]", function(){
      var updateValue1 = 'x';
      //test all models for their own values
      expect(aList.at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(aList.at(1).toJSON()).to.deep.equal(attributes.aList[1]);
      expect(aList.at(2).toJSON()).to.deep.equal(attributes.aList[2]);

      aList.setOn('[*].m', updateValue1);

      aList.each(function(mdl) {
        expect(mdl.get('m')).to.equal(updateValue1);
      });
    });
    it("can set a property on a child model of all models in a child collection using [*]", function(){
      var updateValue1 = 'x';
      //test all models for their own values
      expect(aList.at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(aList.at(1).toJSON()).to.deep.equal(attributes.aList[1]);
      expect(aList.at(2).toJSON()).to.deep.equal(attributes.aList[2]);

      aList.set('[*].b.c', updateValue1);

      aList.each(function(mdl) {
        expect(mdl.get('b').get('c')).to.equal(updateValue1);
      });
    });
    it("can set multiple properties on a child model of all models in a child collection using [*]", function(){
      var updateValue1 = 'x', updateValue2 = 'pp';
      //test all models for their own values
      expect(aList.at(0).toJSON()).to.deep.equal(attributes.aList[0]);
      expect(aList.at(1).toJSON()).to.deep.equal(attributes.aList[1]);
      expect(aList.at(2).toJSON()).to.deep.equal(attributes.aList[2]);

      aList.setOn({
        '[*].b.c': updateValue1,
        '[*].m': updateValue2
      });

      aList.each(function(mdl) {
        expect(mdl.get('b').get('c')).to.equal(updateValue1);
        expect(mdl.get('m')).to.equal(updateValue2);
      });
    });

    /////////////////////////////
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
    it("throws an error when attempting to set a primitive value as a model directly in a collection", function(){
      assert.throws(function() { model.set('aList.m', 'x');}, Error);
    });
  });

  describe(".get on child Collections - ", function() {

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

    it("can get a property from a model in a child collection where id is a string", function(){
      expect(model.get('aList').get('z.m')).to.equal('f');
    });
    it("can get a property from a model in a child collection where id is a number", function(){
      expect(model.get('aList').get('5.m')).to.equal('4');
    });
    it("can get a property from a model in a child collection by order-index", function(){
      expect(model.get('aList').get('[0].m')).to.equal('4');
    });

    it("Model Parent - can get a property from a model in a child collection where id is a string", function(){
      expect(model.get('aList.z.m')).to.equal('f');
    });
    it("Model Parent - can get a property from a model in a child collection where id is a number", function(){
      expect(model.get('aList.5.m')).to.equal('4');
    });
    it("Model Parent - can get a property from a model in a child collection by order-index", function(){
      expect(model.get('aList.[0].m')).to.equal('4');
    });
    it("can not get a property from all models in a child collection using [*]", function(){
      assert.throws(function() { model.get('aList.[*].m');}, Error);
      // If dotPath wildcard notation is implemented,
      // expect(JSON.stringify(model.get('aList.[*].m')) ).to.deep.equal(JSON.stringify(['4','f','p']) );
    });
  });
});