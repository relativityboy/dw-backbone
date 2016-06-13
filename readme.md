#dw-backbone

Add security and clarity to your Backbone Models & Collections with easy to
create custom serializers and de-serializers.

###The pitch
Is coffee script not an option? Is ES-6 still a dream? Is your fancy new app
interfacing with some seriously annoying legacy systems? dw-backbone was created
with these problems in mind.

###What it can do
* **Functions that make your Javascript easier without instantiating anything**
    * .isA - like typeof, but with 'array', 'date', 'NaN'
    * .logicallyIdentical - are these two objects basically the same thing? Supports deep structures. Supports excluding specific attributes from the comparison.
    * .toUnderscored - converts a camelCased string to an underscored one. Pass in an object to convert all it's keys.
    * .toCamel - converts an underscored string to a camelCased one. Pass in an object to convert all it's keys.

* **.Model.constructor** - instantiate the model you want from almost any garbage you throw at it.
    * transformation - and it all happens before a single event is fired.
        * pass underscored data into your model and (optionally) convert it into camelCased attributes
        * pass camelCased data into your model and (optionally) convert it into underscored attributes
        * change a property name from constructor data into a completely different attribute name on the model
        * perform an operation on the data of a property to make it become something else
            * define a custom function
            * stringify or parse the data
    * blacklist - keep specific properties from becoming attributes on your model
    * whitelist - allow only a known subset of properties to become attributes
    * all of the above can be defined for any number of 'modes'

* **.Model.toJSON** - a builtin jsonifier with all the abilities of .constructor, supports nested Models.
* **.Model.logicallyIdentical** - takes either JSON, or a Model.
    * Same basic functionality as .logicallyIdentical
    * Compares only the attributes (and child attributes) of the Models.
* **.Model._set.<attrName>** - custom setters
    * define a function for attribute <attrName> and calls to .set('<attrName>') will first pass the value to your
    function for modification
* **.Model._setCollections** - for child collections as attributes
    * each key <attrName> on this object mirrors an attribute
    * the value of the key is the Collection definition that will be instantiated.
    * calls to .set('<attrName>') with JSON or a Model will trigger a merge
    * the collections are directly accessible via .get
* **.Collection** - supports both .constructor and .toJSON functionality

##