###2016.10.21
* Possible Breaking change! Removed auto-destruct views in Model.dispose().
Views should listen for dispose & delete events and handle removing themselves.