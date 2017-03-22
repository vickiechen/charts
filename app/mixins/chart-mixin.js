import Ember from 'ember';

export default Ember.Mixin.create({
	/*** inject services ***/
	ajaxService: Ember.inject.service(),
	
	/*** chart attributes by default, you can overwrite those attributes on your own component if need ***/	
	/* Array; refer to the ChartJS documentation. This is required, see the getChartData function below to set this value based on the endpoints */
	chartType: ['Pie', 'Line', 'Bar', 'Doughnut', 'polarArea'],
	
	chartData: null,  	
	
	/* String; one of the following -- line, bar, radar, polarArea, pie or doughnut. This is required. We set line chart as default */	
	chartType:'line', 
	
	/* Boolean: indicates if you want to display the legend on your chart, set default as false */	
	legendDisplay: 0,
	
	/* String: Position of the legend. Possible values are 'top', 'left', 'bottom' and 'right' */
	legendPosition: 'right',
	
	/* String : Legend Font Color */
	legendFontColor: '#000000', 
	
	/* Boolean : Legend show full width */
	legendFullWidth: true,
		
	/* Boolean : indicates if want to show tool tip on chart */
	showTooltips: true,
	
	/* String/Array: chart background color by default, if you are using pie or doughnut chart, please use array instead of string */
	backgroundColor: "rgb(113,192,226)",
	
	borderColor: "rgb(113,192,226)",
	
	/* Integer: chart background pointRadius by default */
	pointRadius: 0, 
	
	/* Boolean: indicates if animateScale scall the Doughnut/PolarArea Chart from the centre. */
	animateScale: true,
	
	/* Boolean: indicates if the x and y Axes begin from zero */
	beginAtZero: true,
	
	/* Boolean: indicates if the chart needs to show x and y scales */		
	needScales: true,
	
	/* Integer: xAxes label display on the mod divider. For example: 1 => show all labels, 5=> show 5, 10, 15, 20, etc.. */
	xAxesLabelDivider: 1,
	
	/* Boolean: indicates if the pie/doughnut chart needs to compute an other slice */		
	needOther: false,
	
	/* Integer: indicates pie/doughut chart total slices when it needs to compute an other slice */
	pieMaxSlices: 10,	

	/* set key mapping to retrive chart data from different end points. This is required. please overwrite on your component if you have different mappings */
	keyMapping :{
		key: [ 'chartData' ],    //The data object from response, please put the json key in order. For example ['chartData', 'summary'] => apiData.summary
		label: 'label',          	 //The label you want to display on UI from the data object
		value: 'value'		         //The value you want to display on UI from the data object
	},	
	
	/* chartOptions: Object; refer to the ChartJS documentation. We are setting up this default options based on MDB2 chart gadgets. You might need to overwrite it with your own speical needs, please ref http://www.chartjs.org/docs/ to see options provided based on chart types */
	chartOptions: Ember.computed('chartOptions', function() {
		let self = this;
		return{
			responsive: true,
			showTooltips: self.get('showTooltips'),
			animateScale: self.get('animateScale'),			
			tooltips: {
				callbacks: {
					title: self.toolTipTitle,
					label: self.toolTipLabels
				}
			},
			scales: (!self.get('needScales')?'': {
				xAxes: [{
					ticks: {
						// Create scientific notation labels
						callback: function(value, index, values) {  
							let divider = self.get('xAxesLabelDivider');
							if(!self.isInteger(value) || divider === 1) {   //show all values if the value is not integer or divider = 1
								return value;  
							}
							else if(value%divider === 0 && value > 0){ //only show the value can mode divider and remains 0
								return value;   
							}else{
								return '';				
							}
						},
						beginAtZero: self.get('beginAtZero')
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero:  self.get('beginAtZero')
					}
				}]
			}),			
			onClick: function (event, chartObj){
				self.chartClick(event, chartObj, self);
			},
			onAnimationComplete: function (chartObj){
				self.chartAnimationComplete(chartObj, self);
			}, 
			onAnimationProgress:function (chartObj){
				self.chartAnimationProgress(chartObj, self);
			},
			legend: {
				display: self.get('legendDisplay'),
				position: self.get('legendPosition'),
				fullWidth: self.get('legendFullWidth'),
			    onClick: function (event, legendItem){ 
					self.legendClick(event, legendItem, self);
				},
			    labels: {
				   fontColor: self.get('legendFontColor'),
				   generateLabels: self.legendGenerateLabels
				}
			},
		};
    }),

	/* This is the default tooltip label. please overwrite this function on your component if you need different format */	
	toolTipLabels(tooltipItems, data){		
		return  data.labels[tooltipItems.index] + "  : " + tooltipItems.yLabel;
	},
	
	/* This is the default tooltip title for MDB2 Line Charts. please overwrite this function on your component if you need different format */
	toolTipTitle(tooltipItems, data){		
		return "";
	},
		
	/* Generate legend labels */
	legendGenerateLabels(chart){
		let data  =  chart.data;
		if (data.labels.length && data.datasets.length) {
			return data.labels.map(function(label, i) {
				return {
					text: label + ' (' + data.datasets[0].data[i] + ')',
					initailValue: data.datasets[0].data[i],
					initailText : label,
					fillStyle: data.datasets[0].backgroundColor[i],
					hidden: isNaN(data.datasets[0].data[i]),

					// Extra data used for toggling the correct item
					index: i
				};
			});
		} else {
			return [];
		}
	},	
		
	/* compute pie slice value with other  */	
	computedPieSliceValue: function( chartData, labelPath, valuePath){	
		if(chartData === undefined || this.get('needOther')===false ){
			return chartData;
		}
		
		let self = this;
		let otherValue = 0;
		
		//sort slices by data value DESC
		chartData.sort(function(a,b) { return b[valuePath]-a[valuePath]; });
		
		let newData = [];
		chartData.forEach(function (d, i){
			if(i >= self.get('pieMaxSlices')-1){			
				otherValue += parseInt(d[valuePath]);			
			}
			newData.push(d);
		});			
		newData.splice( (self.get('pieMaxSlices')-1) );		
		
		/* add other slice into data */
		if(otherValue>0){
			let otherslice = {};
			otherslice[labelPath] = "Other";
			otherslice[valuePath] = otherValue;
			newData.push(otherslice);
		}
		
		return newData;	
	},
	
	/* Chart Action for clicking on legend or chart object */
	legendClick(event, legendItem, self){
		Ember.Logger.log("You click on legend Item: ",legendItem);
		return ''; //do nothing by default, please overwrite this function on your component and customize to your need
	},	
	
	chartClick(event, chartObj, self){
		Ember.Logger.log("function called on chart onClick", event);
		return ''; //do nothing by default, please overwrite this function on your component and customize to your need		
	},
	
	chartAnimationComplete(chartObj, self){
		Ember.Logger.log("function called on chart onAnimationComplete", obj);
		return ''; //do nothing by default, please overwrite this function on your component and customize to your need
		
	},
	
	chartAnimationProgress(chartObj, self){
		Ember.Logger.log("function called on chart onAnimationProgress", obj);
		return ''; //do nothing by default, please overwrite this function on your component and customize to your need
	},	
		
	/* get Chart Data from end points and set chartData to generate a chart based on json response data */
	getChartData: function (ajaxService, endpointName, mode){
		
		/* validate ajaxService, endpointName values from params */
		if( !ajaxService || !endpointName ){
			Ember.Logger.log('Invalid ajax service or end point name for getting chart Data!');
			return [];
		}
				
		let extraParam = {
			mode:  (mode?mode:0)  //mode=0 by default
		};
		
		this.get(ajaxService).getData(endpointName,extraParam).then((data) => {
			self.setChartData(data);			
		});		
	},
	
	setChartData(data){
		/* get key mapping for the component, so we know how to get chart data from different json response */
		let keyMapping =  this.get('keyMapping');  
			
		/* get chartData based on the array from keyMapping.key */
		let chartData = data; 
		keyMapping.key.map( (e)=> {
			if(e){
				chartData = chartData[e];
			}
		});
		
		/* compute pie/doughnut chart other slice value if this chart needs other slice */
		if(this.get('needOther')){
			chartData  = this.computedPieSliceValue(chartData, keyMapping['label'], keyMapping['value']);				
		}
			
		/* convert chartData to the object with format that Ember Chart need */
		if(chartData.length) { 
			let graphicData = [],
				labels = [];	
		
			/* assign labels and dataset.data into chartData */
			chartData.map( (element, index) =>{
				if(keyMapping.value!==''){
					graphicData.push(element[keyMapping.value]);	
					labels.push(element[keyMapping.label]);						
				}else{
					graphicData.push(element[index]);				    
					labels.push(index);					
				}					
			});	
			
			/* set chartData */
			this.set('chartData',{
			    labels:labels,
			    datasets: [
					{                 
						data: graphicData,  
						backgroundColor: this.get('backgroundColor'),
						pointRadius: this.get('pointRadius'),
					}
				]				 
			});					
		}		
	},
	
	isInteger(num) {
		return (num ^ 0) === num;
	}
	
});