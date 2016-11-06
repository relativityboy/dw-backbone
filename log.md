##Log:
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


##Notes:
1. Dealing with deletes..... we want parent models to be able to remove a deleted child automatically
We'll do this via event listeners.
    * On set check to see if current attribute is a backbone model
    * if it is
        * Cache the existing model
        * See what the new assigned model is after all special setters are run.
        * If it's exactly the same object/instance 
            * leave it alone.
        * else it's different - do this:
            * remove all 'this' contexted listeners from the cached model
            * set a destroy listner on the new one.
1. Event Bubbling?
    * We could take advantage of the event listener set for the delete event. It could listen for 'all'