import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
       return $.getJSON( "data/chartData.json");  //for getting chart data from a local json file
    } 
});
