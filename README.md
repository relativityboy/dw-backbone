## dw-backbone [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status](https://coveralls.io/repos/github/relativityboy/dw-backbone/badge.svg?branch=master)](https://coveralls.io/github/relativityboy/dw-backbone?branch=master)


Add security and clarity to your Backbone Models & Collections with easy to
create custom serializers and de-serializers. Auto-instantiation of child models & collections. DotPath notation support.


### Philosophy
Resilient patterns and practices are necessary for any long-lived codebase. 
Funky customization is necessary to meet the demands of many an API / UI.
Embrace the funk, but don't let it dominate your work. Be kind to yourself 
and your successors.

dw-backbone was created with these problems in mind.

_*This lib is provided uniminified, because that's either a part of your build process already, or you're like "source-map what?"_

### Exports Model, Collection, and convenience! 

---
Model
---
_extending .Model adds the following functionality_

**new Model()** - instantiate a clean model from almost any garbage you throw at it. Case-convert, transform, black & white list.
```javascript
//model = new Model({object}, [mode])

Model = DWBackbone.Model.extend({
  jsonMaps:{
    'underscored':{ //define as many of these modes as you want.
      'from':{ //used only on 'new'
        'convert':'toCamel', // 'toUnderscored' converts all keys to the specified case
        'inputs':{
          'a_bc':{
            fn:'parse' //'stringify' || function(val)
            //attrName:'aCompletelyDifferentName' if you want it to have a different name on your model
          }, 
        }
        //'include':['atributeName'] - A whitelist. Only these will be used to hydrate the model
        //'exclude:[] - A blacklist. These items will not be used to hydrate the model
      },
      'to':{  //is used with .toJSON calls. only difference between it 
              // and .from is 'inputs' is called 'attrs'
        'convert':'toUnderscored',
        'attrs':{
          'a_bc':{
            fn:'stringify'
           }
        } 
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

model.toJSON('underscored');
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
    y:function(val) { //define a function for attribute \<attrName\> and 
                      // calls to .set('\<attrName\>') will first pass the value 
                      // to your function for modification                            
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

model.set({y:"apple sauce"})
model.get('y') //Apple Sauce

child = model.get('x');
child instanceof Backbone.Model //true
child.get('a') //'b'

model.set('x', {a:'z'});

model.get('x') instanceof Backbone.Model //true
model.get('x') === child //false

//Respects existing models with the same .constructor if you pass them in
model.set('x', child);
model.get('x') === child //true

//Listens for 'destroy' events and removes all listeners and removes the model 
//from .attributes. (un-binds on unset)
child.destroy();
model.get('x') //undefined
````
        
**._setCollections** - declare child collections 
    
```javascript
Point = DWBackbone.Model.extend({
  defaults:{name:'None Specified',x:0,y:0}
});

Points = DWBackbone.Collection.extend({
  model:Point
});

Model = DWBackbone.Model.extend({
  _setCollections:{    
    pointList:Points
  }
});

model = new Model({
  pointList:[{x:1,y:2},{name:'Some name', x:3, y:4}]
});

model.get('pointList') instanceof Points //true
model.get('pointList').pluck('name') //['None Specified','Some name']
model.get('pointList').length //2
model.get('pointList').toJSON() //[{name:'None Specified',x:1, y:2},{name:'Some name', x:3, y:4}]
 
model.set('pointList', [{name:'Another one'}]) //triggers reset
model.get('pointList').length //1
model.get('pointList').toJSON() //[{name:'Another one',x:0, y:0}]

points = new Points([{x:1,y:2},{name:'Some name', x:3, y:4}])
model.set('pointlist', points);
model.get('pointList') === points //false - model maintains its own Points collection
model.get('pointList').at(0) === points.at(0) //true - model retains the Point instances
```
    
**.get()** - accepts dotpath notation.
```javascript
model = new DWBackbone.Model({
  m:new DWBackbone.Model({    
    a:'b',
    c:new DWBackbone.Model({
      d:'e',
      f:new Backbone.Model({
        g:'h'
      }),
      i:{
        j:'k'
      }    
    })
  })
});

model.get('m.a') == 'b' //true
model.get('m.c.p') //undefined - classic Backbone 'undefined' behavior for undefined attributes
model.get('m.c.i.j') //dotPath does not support raw objects
model.get('m.c.d') == 'e' //true - Child Models must extend DWBackbone to support dotPath
model.get('m.c.f.g') == 'h' //true - Last attribute can be Backbone.Model 

```

**.set()** - accepts dotpath notation.

Use it like .get, or set multiple attributes using an object with dotPathed property names.
_*All parts of the path (except the last) must already exist._

---
Collection
---
_extending .Collection adds the following functionality_

**.get()** - accepts dotpath notation.
```javascript
collection = new DWBackbone.Collection([{id:'x', name:'Foo'}, {id:'y', name:'Bar'}, {id:'z', name:'Nasty'}])

collection.get('[1]') === collection.at(1) //true - 
collection.get('z.name') == collection.get('z').get('name') //true
```

**.set('dotpath', val)** - accepts dotpath notation if first argument is a string, default Backbone.Collection behavior otherwise
```javascript
collection = new DWBackbone.Collection([{id:'x', name:'Foo'}, {id:'y', name:'Bar'}, {id:'z', name:'Nasty'}])

collection.set('x.apple','Granny Smith')
collection.get('x').get('apple'); //'Granny Smith' (you could also use a dotPath to get it, but this is less unambiguous.

collection.set('[2].name', 'Not nasty')
collection.at(2).get('name') //'Not nasty'

collection.set('[*].bicycles','Are good')
collection.at(0).get('bicycles') //'Are good'
collection.get('[1].bicycles') //'Are good'
collection.get('z.bicycles') //'Are good'
collection.pluck('bicycles') //['Are good'] - because Backbone.Collection.pluck returns unique values
```

**.setOn()** - accepts dotpath noted objects
```javascript
collection = new DWBackbone.Collection([{id:'x', name:'Foo'}, {id:'y', name:'Bar'}, {id:'z', name:'Nasty'}])

//the following call does all of the .set calls in the previous example
collection.setOn({
  'x.apple':'Granny Smith',
  '[2].name':'Not nasty',
  '[*].bicycles':'Are good'
})

```

**.toJSON()** - supports DWBackbone.Model.toJSON modes

---
Convenience
---
_functions directly off DWBackbone_

**.isA(item, [type])** - used it like typeof, but also returns 'array', 'date', 'NaN', or true/false if type is passed in 
```javascript
DWBackbone.isA([]) //'array'
DWBackbone.isA((1/'apple')) //'NaN'

DWBackbone.isA([], 'array') //true
DWBackbone.isA('some string', 'array') //false
DWBackbone.isA((1/'apple', 'NaN')) //true

```

**.logicallyIdentical({ object 1 },{ object 2 }, [{ ignoreTree }])** - are these two objects basically the same thing? Supports deep structures. Supports excluding specific attributes from the comparison.

**.toUnderscored({ some object })** - converts a camelCased string to an underscored one. Pass in an object to convert all its keys without modifying the values.

**.toCamel({ some object })** - converts an underscored string to a camelCased one. Pass in an object to convert all its keys without modifying the values.

**.setLogger(function() )** - Pass in any logging function you like *_as of 0.5 DWBackbone does not write directly to console.log_

**.getLogger()** - because setLogger was lonely

[npm-image]: http://img.shields.io/npm/v/dw-backbone.svg
[npm-url]: https://www.npmjs.com/package/dw-backbone

[downloads-image]: http://img.shields.io/npm/dm/dw-backbone.svg

[travis-image]: https://api.travis-ci.org/relativityboy/dw-backbone.png
[travis-url]: https://travis-ci.org/relativityboy/dw-backbone

