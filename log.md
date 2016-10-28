###2016.10.26
* Added support for model constructors directly off *._set*.
You can now have *.set.someattribute = SomeModule.Model* and any JSON passed to 
*.set('someattribute', {json})* will be turned into a new *SomeModule.Model*
If you pass an instance of SomeModule.Model, it respects that.
###2016.10.21
* **Breaking change!** Removed auto-destruct views in Model.dispose().
Views should listen for dispose & delete events and handle removing themselves.