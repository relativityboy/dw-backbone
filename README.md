## dw-backbone [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status](https://coveralls.io/repos/github/relativityboy/dw-backbone/badge.svg?branch=master)](https://coveralls.io/github/relativityboy/dw-backbone?branch=master)


Add security and clarity to your Backbone Models & Collections with easy to
create custom serializers and de-serializers. Auto-instantiation of child models & collections. DotPath notation support.


### Philosophy
Resilient patterns and practices are necessary for any long-lived codebase. 
Funky customization is necessary to meet the demands of many an API / UI.
Embrace the funk, but don't let it dominate your work. Be kind to yourself 
and your successors.

dw-backbone was created with these problems in mind.

### Exports Model, Collection, and convenience! 
#### Model 
_extending .Model adds the following functionality_

**new Model()** - instantiate a clean model from almost any garbage you throw at it. Case-convert, transform, black & white list.
```javascript
//model = new Model({object}, [mode])

Model = DWBackbone.Model.extend({
  jsonMaps:{
    'underscored':{ //define as many of these modes as you want.
      'from':{ //used only on 'new'
        'convert':'toCamel',
        'inputs':{
          'a_bc':{
            fn:'parse' //stringify || function(val)
            //attrName:'aCompletelyDifferentName' if you want it to have a different name on your model
          }, 
        }
        //'include':['atributeName'] - A whitelist. Only these will be used to hydrate the model
        //'exclude:[] - A blacklist. These items will not be used to hydrate the model
      },
      'to':{ //supports everything 'from' does, and is used with .toJSON calls.
        'convert':'toUnderscored'
      }
    }
  }
});
obj = {'some_junk':'and_stuff', 'a_bc':"['lazy','java','devs']"};

model = new Model(obj, 'underscored');

model.toJSON(); //{someJunk:'and_stuff', aBc:['lazy','java','devs']}
model.toJSON('underscored'); //{some_junk:'and_stuff', a_bc:['lazy','java','devs']}
```


**.toJSON()** - a builtin jsonifier with transform, blacklist, whitelist. If no mode is specified a naked object version 
of the model. Supports nested Collections & Models.
```javascript
//model.toJSON([mode]);

modelWithCamelCased.toJSON('underscored');
```

**.logicallyIdentical()** - takes either a raw {}, or a Model. Compares the attributes (and child attributes) of the 
Models for logical equivalence (not ===).
 
```javascript
//model.logicallyIdentical([{} | Model])
obj = {a:{b:'c'}};
model = new Model(obj);
model2 = new Model({a:{b:'c'}});

model.logicallyIdentical(model2); //true

model2.logicallyIdentical(obj); //true
```

**._set.\<attrName\>** - declare custom setters in a clean, brief structure. Appropriate setters run on calls to .set. 
Also runs after the transforms on **new Model**
````javascript
Model = DWBackbone.Model.extend({
  _set:{    
    x:DWBackbone.Model, //define a Model and JSON will be hydrated to that model.
    y:function(val) { //define a function for attribute \<attrName\> and calls to .set('\<attrName\>') will first pass the value to your function for modification                            
      return val.toUpperCase(); 
    }
  }
});

model = new Model({
  x:{
    a:'b'
  },
  y:'hello world'
});

model.get('y') //'Hello World'

child = model.get('x');
child instanceof Backbone.Model //true
child.get('a') //'b'

model.set('x', {a:'z'});

model.get('x') instanceof Backbone.Model //true
model.get('x') === child //false

//Respects existing models with the same .constructor if you pass them in
model.set('x', child);
model.get('x') === child //true

//Listens for 'destroy' events and removes all listeners and removes the model from .attributes. (un-binds on unset)
child.destroy();
model.get('x') //undefined
````
---
BELOW THIS LINE README IS OLD FORMAT
---
        
**._setCollections** - for child collections as attributes _Model.setCollections.\<attrName\> = CollectionConstructor_
    * each key \<attrName\> on this object mirrors an attribute
    * the value of the key is the Collection definition that will be instantiated.
    * calls to .set('\<attrName\>') with JSON or a Model will trigger a merge
    * the collections are directly accessible via .get
    
**.get** - accepts dotpath notation.

**.set** - accepts dotpath notation.

#### Collection
_extending .Collection adds the following functionality_
* **.get** - accepts dotpath notation.
* **.set** - accepts dotpath notation.
* **.toJSON** - 

* **Functions that make your Javascript easier without instantiating anything**
    * .isA - like typeof, but with 'array', 'date', 'NaN'
    * .logicallyIdentical - are these two objects basically the same thing? Supports deep structures. Supports excluding specific attributes from the comparison.
    * .toUnderscored - converts a camelCased string to an underscored one. Pass in an object to convert all it's keys.
    * .toCamel - converts an underscored string to a camelCased one. Pass in an object to convert all it's keys.


[npm-image]: http://img.shields.io/npm/v/dw-backbone.svg
[npm-url]: https://www.npmjs.com/package/dw-backbone

[downloads-image]: http://img.shields.io/npm/dm/dw-backbone.svg

[travis-image]: https://api.travis-ci.org/relativityboy/dw-backbone.png
[travis-url]: https://travis-ci.org/relativityboy/dw-backbone

