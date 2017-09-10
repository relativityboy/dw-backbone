## Log:
###2017.09
* .toJSON - added support for null value attributes. :(
###2017.04
* Full support for dotPath on collections.
###2017.03
* More tests (now above 90%)
* Added support for dotPath to Models.
###2016.11.06
* Added code coverage reports. Testing above 80% in all areas. 
* Minor update to isA, boolean responses if a second argument matches type 
(code using isA can be slightly more terse)
###2016.10.29
* Added support for automatic removal of child-models and listeners on them from parent-models
on 'destroy' event.
 This applies only to child-models that have their constructors explicitly declared in ._set.
###2016.10.26
* Added support for model constructors directly off *._set*.
You can now have *.set.someattribute = SomeModule.Model* and any JSON passed to 
*.set('someattribute', {json})* will be turned into a new *SomeModule.Model*
If you pass an instance of SomeModule.Model, it respects that.
###2016.10.21
* **Breaking change!** Removed auto-destruct views in Model.dispose().
Views should listen for dispose & delete events and handle removing themselves.


## Todo:
* Add support directly on collections for dotPath .get and .set 
(currently mixed support within Models.)
