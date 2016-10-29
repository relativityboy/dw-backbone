#dw-backbone

Add security and clarity to your Backbone Models & Collections with easy to
create custom serializers and de-serializers. +tested +auto-instantiation of child models & collections.


###The pitch
Resilient patterns and practices are necessary for any long-lived codebase. 
Funky customization is necessary to meet the demands of many an API / UI.
Embrace the funk, but don't let it dominate your work. Be kind to yourself 
and your successors.

dw-backbone was created with these problems in mind.

###What it can do
* **db-backbone.Model** - 
* **.Model.constructor** - _model = new Model(json, [mode])_ instantiate a clean model from almost any garbage you throw at it.
    * transformation - and it all happens before a single event is fired.
        * pass underscored data into your model and (optionally) convert it into camelCased attributes
        * pass camelCased data into your model and (optionally) convert it into underscored attributes
        * change a property name from constructor data into a completely different attribute name on the model
        * perform an operation on the data of a property to make it become something else
            * define a custom function
            * stringify or parse the data
        * child model instantiation - define an attribute as being an instance, or collection of another model.
    * blacklist - keep specific properties from becoming attributes on your model
    * whitelist - allow only a known subset of properties to become attributes
    * all of the above can be defined for any number of 'modes'

* **.Model.toJSON** - _model.toJSON([mode])_ a builtin jsonifier with all the abilities of .constructor, supports nested Models.
* **.Model.logicallyIdentical** - takes either JSON, or a Model. _model.logicallyIdentical([json/model2])_
    * Same basic functionality as .logicallyIdentical
    * Compares only the attributes (and child attributes) of the Models.
* **.Model._set.\<attrName\>** - custom setters _Model.set.\<attrName\> 
= function(val) {return !val;}_ or _Model.set.\<attrName\> = SomePackage.Model_
    * define a function for attribute \<attrName\> and calls to .set('\<attrName\>') will first pass the value to your
    function for modification
    * define a Model and assign it to _\_set.\<attrName\>_ and JSON will be hydrated to that model. 
        * Respects existing models if you pass them in.
        * Listens for 'destroy' events and removes all listeners 
        and removes the model from .attributes. (un-binds on unset)
* **.Model._setCollections** - for child collections as attributes _Model.setCollections.\<attrName\> = CollectionConstructor_
    * each key \<attrName\> on this object mirrors an attribute
    * the value of the key is the Collection definition that will be instantiated.
    * calls to .set('\<attrName\>') with JSON or a Model will trigger a merge
    * the collections are directly accessible via .get
* **.Collection** - extend this to support your model's .constructor and .toJSON functionality

* **Functions that make your Javascript easier without instantiating anything**
    * .isA - like typeof, but with 'array', 'date', 'NaN'
    * .logicallyIdentical - are these two objects basically the same thing? Supports deep structures. Supports excluding specific attributes from the comparison.
    * .toUnderscored - converts a camelCased string to an underscored one. Pass in an object to convert all it's keys.
    * .toCamel - converts an underscored string to a camelCased one. Pass in an object to convert all it's keys.

##