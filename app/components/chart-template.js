import Ember from 'ember';
import ChartMixin from './../mixins/chart-mixin';

export default Ember.Component.extend(ChartMixin, {
	hasServer: false, //switch to true if you have an api service to get chartData
	didReceiveAttrs () {
        this._super(...arguments);	
	
		if(this.get('hasServer')) {
			/***  For getting chart Data (ajaxServer, endpointName, mode) ***/
			this.getChartData('ajaxService', 'getChartData' , 0 );  
		}else{
			/***  For setting chart Data from the data passed from its route ***/
			this.setChartData(this.get('chartData'));			
		}
	},
	
	actions:{
		changeChartType(type){
			this.set('chartType', type);	
		}		
	}
	
});
