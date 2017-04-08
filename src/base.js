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
  _exports.isA = isA = function(obj, is) {
    var type = typeof obj;
    if(is) {
      switch (type) {
        case 'object' :
          if (obj === null) {
            return 'null' === is;
          }
          if (obj.constructor === Array) {
            return 'array' === is;
          }
          if (obj.constructor === Date) {
            return 'date'=== is;
          }

          break;
        case 'number' :
          if (isNaN(obj)) {
            return 'NaN' === is;
          }
      }
      return type === is;
    } else {
      switch (type) {
        case 'object' :
          if (obj === null) {
            return 'null';
          }
          if (obj.constructor === Array) {
            return 'array';
          }
          if (obj.constructor === Date) {
            return 'date';
          }

          break;
        case 'number' :
          if (isNaN(obj)) {
            return 'NaN';
          }
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
   * *note: do not use on recursive objects!
   * @type {toUnderscored}
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

  /**
   * Underscores and then 'pretty stringifies' whatever is passed in.
   * @param obj
   * @returns ""
   */
  _exports.toUnderscoredJSONString = function(obj) {
    return toJSONString(toUnderscored(obj));
  };

  /**
   * This function is being considered for deprecation
   * _.clones 'mask' and removes attributes named in 'cleanList'
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
   * This function is being considered for deprecation
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
        if(item1.getTime() !== item2.getTime())
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
    dotPathIsChildTree:true,
    constructor: function(attributes, options) {
      this._destroyListeners = {}; //allows us to track DWB managed child-models for on-destroy unbinding & unset
      switch(_exports.isA(options)) {
        case 'string' :
          options = {mode:options};
          break;
        case 'undefined' :
          options = {};
          if(this.jsonMaps && this.jsonMaps.hasOwnProperty('_') && this.jsonMaps._.hasOwnProperty('from')) {
            options.mode = '_';
          }
      }

      if(options.mode) {
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
     * Disposes of self and first level child models.
     */
    dispose:function() {
      var i;
      for(i in this.attributes) if(this.attributes.hasOwnProperty(i)) {
        if( (typeof this.attributes[i].dispose === 'function') && (this.attributes[i] instanceof Backbone.Model) || (this.attributes[i] instanceof _exports.Collection) ) {
          this.attributes[i].dispose();
        }
      }
      this.removeParent();
      this.trigger('disposed', this);
      this.trigger('destroy', this);
    },
    _set:{},
    _setCollections:{},

    /**
     * Internal function. Creates an attribute assignment specific on-destroy listener.
     * @param model
     * @param atrName
     * @returns {Function}
     */
    makeDestroyListener:function(model, atrName) {
      var self = this;
      return function() {
        model.off(null, null, self);
        if(self.attributes[atrName] === model) {
          delete self._destroyListeners[atrName];
          self.unset(atrName);
        }
      };
    },
    
    get:function (attrName) {
      var atr;
      if(this.dotPathIsChildTree && typeof attrName === 'string') {
        var dotAtrNameSuffix = attrName.split('.');
        if(dotAtrNameSuffix.length > 1) {
          var dotAtrName = dotAtrNameSuffix.shift();
          if(this.attributes.hasOwnProperty(dotAtrName)) {
            atr = this.attributes[dotAtrName];
            if(atr instanceof Backbone.Model || atr instanceof Backbone.Collection) {
              return atr.get(dotAtrNameSuffix.join('.'));
            }
            throw new Error('Attempting to access a nested property that is not a Backbone.Model/Collection');

          }
        }
      }
      return Backbone.Model.prototype.get.call(this, attrName);
    },

    /**
     * this can be over-ridden by extending classes
     * @param attrs
     * @param options
     * @returns {*}
     * @private
     */
    //_setSpecial:_setSpecial,

    set: function (key, val, options) {
      var atrName, attrs, newAttr, oldAttr, dotAttrs = false, dotAtrName, dotAtrNameSuffix;

      //1. collect arguments into a single format
      if (typeof key === 'object') {
        attrs = _.clone(key);
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      //2. set the parent model if there's a new one
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

      //3. prep for dotNotation set call. Comes first because dot-noted attributes need to be set 'last'
      if(this.dotPathIsChildTree) {
        dotAttrs = {};
        for(dotAtrName in attrs) if(attrs.hasOwnProperty(dotAtrName) && typeof dotAtrName === 'string') {
          dotAtrNameSuffix = dotAtrName.split('.');
          if(1 < dotAtrNameSuffix.length) {
            atrName = dotAtrNameSuffix.shift();
            if(!dotAttrs.hasOwnProperty(atrName)) {
              dotAttrs[atrName] = {};
            }
            dotAttrs[atrName][dotAtrNameSuffix.join('.')] = attrs[dotAtrName];
            delete attrs[dotAtrName];
          }
        }
      }
      //4. Process non-dot noted attributes with custom setters & getters
      //These are Managed Collections, Models, and attribute specific operations
      for(atrName in attrs) if(attrs.hasOwnProperty(atrName)) {

        newAttr = attrs[atrName];
        oldAttr = this.attributes[atrName];

        //4.a. Handling Collections
        if(this._setCollections.hasOwnProperty(atrName)) {
          if(!oldAttr || (oldAttr.constructor !== this._setCollections[atrName])) {
            this.attributes[atrName] = new this._setCollections[atrName]();
          }

          if(newAttr.constructor === this._setCollections[atrName]) {
            console.log('warning: attempting to set backbone collection as attribute:' + atrName + ' this attribute maintains it\'s own internal collection. Using .models array & discarding collection');
            newAttr = _.clone(attrs[atrName].models); //we don't want the original collection's array, just its contents.
          }
          if(this._set.hasOwnProperty(atrName)) {
            newAttr = this._set[atrName].call(this, newAttr, options);
          }
          this.attributes[atrName].set(newAttr);
          delete attrs[atrName];
          this.trigger('change:' + atrName);
        }
        //4.b. Handling classic '_set'
        else if(this._set.hasOwnProperty(atrName) ) {
          if(this._set[atrName].prototype instanceof Backbone.Model) { //if the attribute wants to be a model, hydrate it if needed!
            if(newAttr && newAttr instanceof this._set[atrName] === false) {
              newAttr = new this._set[atrName](newAttr);
            }
          } else {
            newAttr = this._set[atrName].call(this, newAttr, options);;
          }

          //we're checking for & creating unique destroy listeners because the child-model may be assgined to this model
          // @ more than one attribute.
          if(oldAttr && (oldAttr instanceof Backbone.Model) && this._destroyListeners[atrName]) {
            oldAttr.off(null, this._destroyListeners[atrName]);
            delete this._destroyListeners[atrName];
          }
          if(newAttr && (newAttr instanceof Backbone.Model)) {
            this._destroyListeners[atrName] = this.makeDestroyListener(newAttr, atrName);
            newAttr.on('destroy', this._destroyListeners[atrName], this);
          }
          attrs[atrName] = newAttr;
        }
      }

      //5. handle legacy and attribute combination behaviors by extending classes - deprecated behavior!
      if(this._setSpecial) {
        attrs = this._setSpecial(attrs, options);
      }

      //6. Punt to the standard Model#set for default Backbone behaviors - we have not set dot.path attributes yet.
      Backbone.Model.prototype.set.call(this, attrs, options);

      //7. Set dot.path attributes last (because classic behaviors should come first!)
      if(this.dotPathIsChildTree) {
        for(atrName in dotAttrs) if(dotAttrs.hasOwnProperty(atrName)) {
          if(this.attributes[atrName] instanceof Backbone.Model) {
            this.attributes[atrName].set(dotAttrs[atrName]);
          } else if(this.attributes[atrName] instanceof _exports.Collection) {
            this.attributes[atrName].setOn(dotAttrs[atrName]);
          } else {
            throw new Error('Error attempting to use dot notation to set property on non Backbone.Model/DWBackbone.Collection (could be property has not been instantiated');
          }
        }
      }

      //8. Return self, as per classic Backbone behavior
      return this;
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
        if(typeof this.attributes[key] !== 'undefined') {
          rspAttrName = (map.attrs[key] && map.attrs[key].fieldName) ? map.attrs[key].fieldName : converter(key);
          rsp[rspAttrName] = (typeof this.attributes[key].toJSON === 'function') ? this.attributes[key].toJSON(options, mode) : (typeof this.attributes[key] === 'object') ? converter(this.attributes[key]) : this.attributes[key];
          if (map.attrs[key] && map.attrs[key].fn) {
            if (map.attrs[key].fn == 'stringify') {
              rsp[rspAttrName] = JSON.stringify(rsp[rspAttrName]);
            } else if (map.attrs[key].fn == 'parse') {
              rsp[rspAttrName] = JSON.parse(rsp[rspAttrName]);
            } else if (typeof map.attrs[key].fn === 'function') {
              rsp[rspAttrName] = map.attrs[key].fn.call(this, rsp[rspAttrName]);
            } else {
              throw new Error('When attempting toJSON(' + mode + ') map.attrs.' + key + '.fn was not a valid value');
            }
          }
        }
      }, this);

      return rsp;
    },

    fromJSON:function(data, mode) {
      var keys, map = {inputs:{}}, rsp = {}, rspAttrName, converter = function(val) { return val};

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
    dotPathIsChildTree:true,
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
    },
    /**
     *
     * @param idi - ID or Index.
     * @returns {*}
     */
    get:function(idi) {
      var model;
      if(this.dotPathIsChildTree && typeof idi === 'string') {
        var dotAtrNameSuffix = idi.split('.');
        if(dotAtrNameSuffix.length > 1) {
          var getterExpr = dotAtrNameSuffix.shift();
          if (0 === getterExpr.indexOf('[')) {
            getterExpr = getterExpr.replace('[', '').replace(']', '');
            if('*' === getterExpr) {
              throw new Error('Wildcard dotPath notation not yet supported in Collections ' + idi);
            }
            model = this.at(parseInt(getterExpr));
          } else {
            model = this.get(getterExpr);
          }
          if (model) {
            return model.get(dotAtrNameSuffix.join('.'));
          }
        }
      }

      return Backbone.Collection.prototype.get.call(this, idi);
    },
    set:function() {
      if(typeof arguments[0] === 'string') {
        return this.setOn(arguments[0], arguments[1]);
      }
      return Backbone.Collection.prototype.set.apply(this, arguments);
    },
    setOn:function() {
      var args = arguments[0], i;
      if(typeof arguments[0] === 'string') {
        args = {};
        args[arguments[0]] = arguments[1];
      }
      _.each(args, function(val, dotAtrName) {
        var dotAtrNameSuffix = dotAtrName.split('.'),
          getterExpr = dotAtrNameSuffix.shift(),
          attrs;
        if(dotAtrNameSuffix.length < 1) {
          attrs = val;
          if(typeof attrs !== 'object' || attrs instanceof Array) {
            throw new Error('Attempting to use dotPath notation to set a property directly on a Collection. (' + dotAtrName + '). This is not supported. (Did you forget the .<id>. or .[index].)?');
          }
        } else {
          attrs = {};
          attrs[dotAtrNameSuffix.join('.')] = val;
        };

        if(0 === getterExpr.indexOf('[')) {
          getterExpr = getterExpr.replace('[','').replace(']','');
          if('*' === getterExpr) {
            return this.setOnAll(attrs);
          } else {
            this.at(parseInt(getterExpr)).set(attrs);
          }
        } else {
          this.get(getterExpr).set(attrs);
        }
      }, this);
      return this;
    }
  });
  return _exports;
});
