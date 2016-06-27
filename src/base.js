//todo: need to create the constructor function, and then create the new 'set' functionality.

if (typeof define !== 'function') {
 var define = require('amdefine')(module);
 }
define([
  'underscore',
  'backbone'
], function(
  _,
  Backbone
) {
  var _exports = {},
    Model,
    Collection,
    View,
    isA,
    toCamel,
    toUnderscored,
    toJSONString,
    cleanObject,
    logicallyIdentical;

 // _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

  //SUPPORT FUNCTIONS & VARIABLES

  /**
   * Like 'typeof' operator but outputs 'array', 'date', 'NaN', 'null' for conforming items.
   * @type {isA}
   */
  _exports.isA = isA = function(obj) {
    var type = typeof obj;
    switch(type) {
      case 'object' :
        if(obj === null) {
          return 'null';
        }
        if(obj.constructor === Array) {
          return 'array';
        }
        if(obj.constructor === Date) {
          return 'date';
        }

        break;
      case 'number' :
        if(isNaN(obj)) {
          return 'NaN';
        }
    }
    return type;
  };

  _exports.deepClone = deepClone = function(val) {
    var resp;
    if(typeof val === 'undefined') {
      val = this;
    }
    switch(isA(val)) {
      case 'array' :
        resp = [];
      case 'object' :
        resp = resp? resp : {};
        _.each(val, function(prop, key){
          switch(isA(prop)) {
            case 'object' :
            case 'array' :
              resp[key] = deepClone(prop);
              break;
            default :
              resp[key] = prop;
          }
        });
        return resp;
      case 'string' :
        return val;
    }
    return _.clone(val); //we clone, because every other behavior results in clone
  }

  /**
   * Recursively converts the passed in under_scored item into a camelCased one.
   * *note: removes all '_' (incl multiple underscores)
   * *note: do not use on recursive objects!
   * @type {toCamel}
   */
  _exports.toCamel = toCamel = function(val){
    var resp;
    if(typeof val === 'undefined') {
      val = this;
    }
    switch(isA(val)) {
      case 'array' :
        resp = [];
      case 'object' :
        resp = resp? resp : {};
        _.each(val, function(prop, key){
          switch(isA(prop)) {
            case 'object' :
            case 'array' :
              resp[toCamel(key)] = toCamel(prop);
              break;
            default :
              resp[toCamel(key)] = prop;
          }
        });
        return resp;
      case 'string' :
        return val.replace(/(\_[a-z])/g, function ($1) {
          return $1.toUpperCase().replace('_', '');
        });
    }
    return _.clone(val); //we clone, because every other behavior results in clone
  };


  /**
   * Calls JSON.stringify(obj, null, '   ');
   * @type {stringify}
   */
  _exports.stringify = toJSONString = function(obj) {
    return JSON.stringify(obj, null, '   ');
  }

  /**
   * Recursively converts the passed in camelCased item into a under_scored one.
   * *note: removes all '_' (incl multiple underscores)
   * *note: do not use on recursive objects!
   * @type {toCamel}
   */
  _exports.toUnderscored = toUnderscored = function(val) {
    var resp;
    if(typeof val === 'undefined') {
      val = this;
    }
    switch(isA(val)) {
      case 'array' :
        resp = [];
      case 'object' :
        resp = resp? resp : {};
        _.each(val, function(prop, key){
          switch(isA(prop)) {
            case 'object' :
            case 'array' :
              resp[toUnderscored(key)] = toUnderscored(prop);
              break;
            default :
              resp[toUnderscored(key)] = prop;
          }
        });
        return resp;
      case 'string' :
        return val.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
    }
    return _.clone(val); //we clone, because every other behavior results in clone
  }

  _exports.toUnderscoredJSONString = function(obj) {
    return toJSONString(toUnderscored(obj));
  };

  /**
   * clones 'mask' and removes attributes named in 'cleanList'
   * @type {_exports.newMask}
   */
  var cleanMask = _exports.newMask = function(mask, cleanList) {
    mask = _.clone(mask);
    if(cleanList) {
      for(var i = 0; i < cleanList.length; i++) {
        delete mask[cleanList[i]];
      }
    }

    return mask;
  };

  /**
   * takes and object 'obj' and returns a cleaned object where only attributes in the mask 'mask' remain
   * @param obj
   * @param mask - an object tree of allowed attributes.
   * @param key
   * @param exclude
   * @returns {*}
   */
  _exports.cleanObject = cleanObject = function(obj, mask, key, exclude) {
    var i, rsp;
    if(exclude) {
      throw new Error('Base.cleanObject: exclude option not yet supported. Object\n', toJSONString(obj));
    }
    if (obj.constructor === Array) {
      rsp = [];
      _.each(obj, function (ob) {
        if (mask.constructor !== Array) {
          rsp.push(cleanObject(ob, mask, exclude));
        } else { //if the mask is an array, you get a 'free pass' - note the mask can be an object and an array of items is still supported.
          rsp.push(ob);
        }

      });
      return rsp;
    }
    rsp = {};
    for (i in mask) if (mask.hasOwnProperty(i)) {
      if (obj.hasOwnProperty(i)) {
        if (typeof mask[i] === 'object') {
          rsp[i] = cleanObject(obj[i], mask[i], i, exclude);
        } else {
          rsp[i] = obj[i];
        }
      }
    };
    return rsp;
  };

  /**
   * Determines if objects have all the same attribute names and properties if they are strings or numbers, and that any
   * child objects and arrays are evaluated in the same way.
   *
   * @param item1 - item to be compare with item2
   * @param item2 - item to be compared with item 1
   * @param ignoreTree - an object tree of properties to be ignored. value of properties must be boolean 'true', or and object with child properties to be ignored.
   *                     **please note arrays must be ignored in their entirity. Individual items in arrays cannot be ignored @ this time.
   * @returns {boolean}
   */
  _exports.logicallyIdentical = logicallyIdentical = function(item1, item2, ignoreTree) {
    var i,
      key,
      item1Keys = [],
      item1Type = isA(item1);

    ignoreTree = (isA(ignoreTree) === 'object')? ignoreTree : {};

    if(item1Type !== isA(item2))
      return false;

    switch(item1Type) {
      case 'array' :
        if(item1.length !== item2.length) {
          return false;
        }
        for(i = 0; i < item1.length; i++) {
          if(!logicallyIdentical(item1[i], item2[i], ignoreTree))
            return false;
        };
        break;
      case 'object' :
        for(key in item1) if (item1.hasOwnProperty(key) && (ignoreTree[key] !== true)) {
          item1Keys.push(key);
          if(!item2.hasOwnProperty(key))
            return false;
          if(!logicallyIdentical(item1[key], item2[key], ignoreTree[key]))
            return false;
        }
        //make sure all properties of obj2 are in obj1
        for(key in item2) if(item2.hasOwnProperty(key) && (ignoreTree[key] !== true)) {
          if(item1Keys.indexOf(key) < 0) {
            return false;
          }
        }
        break;
      case 'date' :
        if(item1[key].getTime() !== item2[key].getTime())
          return false;
        break;
      case 'NaN' :
        //NaN are not equivalent in Javascript when evaluated with == or === but structurally they'd be the same, so 'pass'
        break;
      case 'number' :
      case 'string' :
      case 'null' :
        if(item1 !== item2) {
          return false;
        }
    }

    return true;
  };

  //ROOT MODEL
  _exports.Model = Model = Backbone.Model.extend({
    constructor: function(attributes, options) {
      switch(_exports.isA(options)) {
        case 'string' :
          options = {mode:options};
          break;
        case 'undefined' :
          options = {mode:false};
      }
      if(this.jsonMaps.hasOwnProperty(options.mode)) {
        attributes = this.fromJSON(attributes, options.mode);
      }
      arguments[0] = attributes;
      Backbone.Model.apply(this, arguments);

    },
    /**
     * Compares the attributes of this model with another model, or json in the same structure.
     *
     * @param modelJSON - if modelJSON has a 'toJSON' property, it will be called.
     * @param ignoreTree - an object tree of properties to be ignored. value of properties must be boolean 'true', or and object with child properties to be ignored.
     * @returns {boolean}
     */
    logicallyIdentical:function(modelJSON, ignoreTree) {
      modelJSON = (modelJSON.toJSON && isA(modelJSON.toJSON) === 'function')? modelJSON.toJSON(): modelJSON;
      if(ignoreTree === true) {
        ignoreTree = {id:true};
      }
      return logicallyIdentical(this.toJSON(), modelJSON, ignoreTree);
    },

    /**
     * WIP: Removes views associated with this model.
     * Deregistration of listeners will be supported, but you have to do that yourself for now.
     */
    dispose:function() {
      var views;
      if(this.views) {
        views = _.clone(this.views);
        _.each(views, function(view) {
          view.remove();
        });
      }
      for(var i in this.attributes) if(this.hasOwnProperty(i)) {
        if(((this.attributes[i] instanceof Backbone.Model) == true) || ((this.attributes[i] instanceof _export.Collection) == true)) {
          try {
            this.attributes[i].dispose();
          } catch (e) {
            console.log('When disposing of', this, 'child model .' + i, this.attributes[i], 'did not have dispose function')
          }
        }
      }
      this.removeParent();
      this.trigger('dispose', this);
    },
    _set:{},
    _setCollections:{},
    /**
     * this can be over-ridden by extending classes
     * @param attrs
     * @param options
     * @returns {*}
     * @private
     */
    _setSpecial:function(attrs, options) {
      return attrs;
    },
    
    set: function (key, val, options) { //this function is MIT licensed from a 3rd party.
      // This first bit is what `set` does internally to deal with
      // the two possible argument formats.
      var attrs, attr;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      if(attrs && attrs.parentModel) {
        if(this.parentModel && this.parentModel !== attrs.parentModel) {
          this.removeParent();
        }

        this.parentModel = attrs.parentModel;
        if(!this.parentModel._childModels) {
          this.parentModel._childModels = new _exports.Collection();
        }
        this.parentModel._childModels.add(this);
        delete attrs.parentModel;
      }

      for(attr in this._setCollections) if(this._setCollections.hasOwnProperty(attr) && attrs.hasOwnProperty(attr)) {
        if(!this.attributes[attr] || this.attributes[attr].constructor !== this._setCollections[attr]) {
          this.attributes[attr] = new this._setCollections[attr]();
        }
        if(attrs[attr].constructor === this._setCollections[attr]) {
          console.log('warning: attempting to set backbone collection as attribute:' + attr + ' this attribute maintains it\'s own internal collection. Using .models array & discarding collection');
          attrs[attr] = attrs[attr].models;
        }
        if(this._set.hasOwnProperty(attr)) {
          attrs[attr] = this._set[attr].call(this, attrs[attr], options);
        }
        this.attributes[attr].set(attrs[attr])//, {merge:true});
        delete attrs[attr];
        this.trigger('change:' + attr)
      }

      for(attr in this._set) if(this._set.hasOwnProperty(attr) && attrs.hasOwnProperty(attr)) {
        attrs[attr] = this._set[attr].call(this, attrs[attr], options);
      }

      // Clean up the incoming key/value pairs.
      attrs = this._setSpecial(attrs, options);

      // And then punt to the standard Model#set
      return Backbone.Model.prototype.set.call(this, attrs, options);
    },
    /**
     * If this model has a parent, parentModel removes any parent/child relationship that exists
     * @param parentModel  - optional - If undefined will use this model's parent if defined.
     */
    removeParent:function(parentModel) {
      if(this.parentModel && (this.parentModel === parentModel || typeof parentModel === 'undefined')) {
        this.parentModel.off(null, null, this);
        if (this.parentModel && this.parentModel._childModels) {
          this.parentModel._childModels.remove(this); //we assume every model extends Base.Model or a child thereof
        }
        delete this.parentModel
      }
    },
    jsonMaps:{},
    toJSON:function(options, mode) {

      if(typeof options === 'string' && typeof mode == 'undefined') {
        mode = options;
      }
      var keys, map = {attrs:{}}, rsp = {}, rspAttrName, converter = deepClone;
      mode = (mode)? mode : '_';

      if((mode !== '_') || (mode === '_' && this.jsonMaps.hasOwnProperty('_') && this.jsonMaps._.hasOwnProperty('to'))) {
        map = (this.jsonMaps[mode] && this.jsonMaps[mode].to) ? this.jsonMaps[mode].to : false; //['to' + mode + 'JSONMap'];
        map.attrs = (map.hasOwnProperty('attrs')) ? map.attrs : {};
        if (!map) { //we want to be pretty strict here. All objects in the tree must know they're going to be called within a particular context.
          throw new Error('toJSON mode:' + mode + ' does not have a map (jsonMaps.' + mode + '.to) for all models in the tree being Jsonified');
        }

        if (map.include) {
          keys = map.include;
        } else if (map.exclude) {
          keys = [];
          for (var key in this.attributes) if (this.attributes.hasOwnProperty(key)) {
            if (map.exclude.indexOf(key) == -1) {
              keys.push(key)
            }
          }
        } else {
          keys =  _.keys(this.attributes);
        }
        if(map.convert) {
          if (map.convert === 'toCamel') {
            converter = toCamel;
          } else if (map.convert == 'toUnderscored') {
            converter = toUnderscored;
          } else {
            console.log('warning: invalid attribute name converter "' + map.convert + '" specified')
          }
        }

      } else {
        keys = _.keys(this.attributes);
      }
      _.each(keys, function(key) {
        rspAttrName = (map.attrs[key] && map.attrs[key].fieldName) ? map.attrs[key].fieldName : converter(key);
        rsp[rspAttrName] = (typeof this.attributes[key].toJSON === 'function')? this.attributes[key].toJSON(options, mode) : (typeof this.attributes[key] === 'object')? converter(this.attributes[key]) : this.attributes[key];
        if(map.attrs[key] && map.attrs[key].fn) {
          if(map.attrs[key].fn == 'stringify') {
            rsp[rspAttrName] = JSON.stringify(rsp[rspAttrName]);
          } else if(map.attrs[key].fn == 'parse') {
            rsp[rspAttrName] = JSON.parse(rsp[rspAttrName]);
          } else if(typeof map.attrs[key].fn === 'function') {
            rsp[rspAttrName] = map.attrs[key].fn.call(this, rsp[rspAttrName]);
          } else {
            throw new Error('When attempting toJSON map.attrs.<key>.fn was not a valid value');
          }
        }

      }, this);

      return rsp;
    },
    
    fromJSON:function(data, mode) {
      var keys, map = {inputs:{}}, rsp = {}, rspAttrName, converter = function(val) { return val};;
      if(!mode && this.jsonMaps.hasOwnProperty('_') && this.jsonMaps._.hasOwnProperty('from')) {
        mode = '_';
      }
      if(mode) {
        map = (this.jsonMaps[mode] && this.jsonMaps[mode].from) ? this.jsonMaps[mode].from : false;
        if (!map) { //we want to be pretty strict here. All objects in the tree must know they're going to be called within a particular context.
          throw new Error('fromJSON mode:' + mode + ' does not have a map (jsonMaps.' + mode + '.from) for all models in the tree being Jsonified');
        }
        map.inputs = (map.hasOwnProperty('inputs')) ? map.inputs : {};

        if (map.include) {
          keys = map.include;
        } else if (map.exclude) {
          keys = [];
          for (var key in data) if (data.hasOwnProperty(key)) {
            if (map.exclude.indexOf(key) == -1) {
              keys.push(key)
            }
          }
        } else {
          keys = _.keys(data);
        }

        if (map.convert === 'toCamel') {
          converter = toCamel;
        } else if (map.convert == 'toUnderscored') {
          converter = toUnderscored;
        }
      } else {
        keys = _.keys(data);
      }
      _.each(keys, function(key) {
        rspAttrName = (map.inputs[key] && map.inputs[key].attrName) ? map.inputs[key].attrName : converter(key);
        rsp[rspAttrName] = (typeof data[key] === 'object')? converter(data[key]) : data[key];
        if(map.inputs[key] && map.inputs[key].fn) {
          if(map.inputs[key].fn == 'stringify') {
            rsp[rspAttrName] = JSON.stringify(rsp[rspAttrName]);
          } else if(map.inputs[key].fn == 'parse') {
            rsp[rspAttrName] = JSON.parse(rsp[rspAttrName]);
          } else if(typeof map.inputs[key].fn === 'function') {
            rsp[rspAttrName] = map.inputs[key].fn.call(this, rsp[rspAttrName]);
          } else {
            throw new Error('When attempting fromJSON map.attrs.<key>.fn was not a valid value');
          }
        }

      }, this);

      return rsp;
    }

  });

  //ROOT COLLECTION
  Collection = _exports.Collection = Backbone.Collection.extend({
    model:Model,
    constructor:function(json, options) {
      if(typeof options === 'string') {
        arguments[1] = {mode: options};
      }
      Backbone.Collection.apply(this, arguments);
    },
    toJSON:function(options, mode) {
      var i, model, rsp = [];
      for(i = 0; i < this.length; i++) {
        model = this.at(i);

        rsp.push(model.toJSON.apply(model, arguments));
      }
      return rsp;
    },
    setOnAll:function(attrs, options) {
      this.each(function(model) {
        model.set(attrs, options);
      });
      return this;
    },
    callOnAll:function(fnName, options) {
      this.each(function(model) {
        model[fnName](options);
      });
      return this;
    },
    unsetOnAll:function(attr) {
      this.each(function(model) {
        model.unset(attr);
      });
      return this;
    }
  });
/** No tests for the following yet. Still fleshing out ideas.
  //ROOT VIEW
  View = _exports.View = Backbone.View.extend({
    '$elf':function(cssExpr) {
      return this.$el.find(cssExpr);
    },
    setViewOnModel:function() {
      if(!this.model.hasOwnProperty('views')) {
        this.model.views = [];
      }
      this.model.views.push(this);
    },
    /**
     * called inside setModel() only if there is a .model on the view.
     * extending views can implement this function if there are children or special operations to be done before
     * just after unstickit() is called
     * @param model
     * /
    setModelAfterUnstickit:function(model) {
      //this is a no-op, extending views can implement this function if there are children
    },
    /**
     * called inside setModel()
     * extending views can implement this function if there are children or special operations to be done before
     * before stickit() is called
     * @param model
     * /
    setModelBeforeStickit:function(model) {
      //this is a no-op, 
    },
    setModel:function(model) {
      this.unsetModel();
      if(model) {
        if(model) {
          this.model = model;
          this.bindModel();
        }
        /* this.setModelAfterUnstickit(model);
        if(this.setViewOnModel && this.model.views) {
          for(var i = 0; i < this.model.views.length; i++) {
            if(this === this.model.views[i]) {
              this.model.views.splice(i, 1);
              break;
            }
          }
        } * /
      }
      this.model = model;
      if(typeof this.setViewOnModel === 'function') {
        this.setViewOnModel();
      }
      this.setModelBeforeStickit(model);
      this.stickit();
      return this;
    },
    bindModel:function() {
      throw new Error('View must implement bindModel');
    },
    unsetModel: function() {
      if(this.model) {
        this.model.off(null, null, this);
        this.unstickit();
        this.disposeChildViews();
        delete this.model;
      }
    },
    remove:function() {
      if(this.model && this.model.views) {
        for(var i = 0; i < this.model.views.length; i++) {
          if(this === this.model.views[i]) {
            this.model.views.splice(i, 1);
            break;
          }
        }
      }
      Backbone.View.prototype.remove.call(this);
    }
  }); */
  return _exports;
});
/*
///
jsonMaps = { //this, once supporting code is written defines mappings to &&|| from an object format.
  DB:{
    to:{
      convert:'', //may be one of 'toCamel', 'toUnderscored'- optional
      include:[], //if present, ONLY these attributes will be included
      exclude:[], //if present and include is not present, ONLY these attributes will be excluded
      attrs:{ //- optional
        attrName:{ //if attribute 'attrName' is present, it will be processed with the contained options
          fieldName:'<outputFieldName>', //will be assigned to this name - optional
          fn:'' //may be one of ['stringify', 'parse', function] - optional
        }
      }
    },
    from:{ //used on construct, if special option provided in constructor. operations happen before 'set'
      convert:'', //may be one of 'toCamel', 'toUnderscored'
      include:[], //if present, ONLY these attributes will be included
      exclude:[], //if present and include is not present, ONLY these attributes will be excluded
      inputs: { //- optional
        inputName:{ //if  'inputName' is present, it will be processed with the contained options
          attrName:'<outputAttrName>', //will be assigned to this name - optional
          fn:'' //may be one of ['stringify', 'parse', function] - optional
        }
      }
    }
  }
}
*/