import Ember from 'ember';
const {Logger} = Ember;
//import config from './../config/environment';

export default Ember.Service.extend({

	restEndPointMaps:{ /**** All API mappings ***/
		/*** MDB2 dashboard ***/
		'getChartData':{'endPointName':'getChartData','title':'Get Chart Data From API','api':'/chartData'},	
	},

	/***
	 Return an obj with the information of the REST service endpoint
	 @param {string} key = key on the mapping
	 @return {object} stat information.
	 ***/
	getEndPointInfo: function (endPointName){
		let restEndPointMaps = this.get('restEndPointMaps');
		let dt = restEndPointMaps[endPointName];
		restEndPointMaps =  null;
		return dt;
	},
	/**
		Return the mandatories params used on each request acording to the endpoint configuration requirements
	**/
	getRequiredParams: function (endPointName) {
		let endpointInfo  = this.getEndPointInfo(endPointName);
		let	params = {
			userID:  'Tester',
		};
		return params;
	},	
	/**
		Return the mandatories params mixed with the extraParams to use in a request
	**/
	addExtraParams: function (extraParams, params){
		let newParams = params;
		if(extraParams!==undefined){
			for(let key in extraParams) {
				if(extraParams.hasOwnProperty(key)) {
					if(newParams.length>0) {
						newParams.push(key, extraParams[key]);
					}
					else{
						newParams[key] = extraParams[key];
					}
				}
			}
		}
		return newParams;
	},
	/**
		Return the response of a GET resquest 
	**/
	getData: function(endPointName, extraParams=[], async=true) {
		let self = this;
		let endpointInfo = this.getEndPointInfo(endPointName);
		if(endpointInfo===undefined || endpointInfo===''){
			Ember.Logger.error('Unable to locate API URL:' + endPointName);
			return false;
		}
		
		let apiURL = 'http://localhost:4401' + endpointInfo.api;
		let params = this.getRequiredParams(endPointName);
		if(extraParams!==undefined) {
			params = this.addExtraParams(extraParams, params);
		}

		Ember.Logger.log('Ajax Get Call:', apiURL, params);
		
		let res = Ember.$.ajax({
			url: apiURL,
			data: params,
			async: async,
			beforeSend: function (xhr){},
			type: 'GET',
			dataType: 'json',
			error: function(jqXHR, textStatus, errorThrown) {
				Ember.Logger.error(textStatus, errorThrown, jqXHR);
			}
		})
		res.then( function (data) {
			if(data.errorMsg!==undefined && data.errorMsg!==''){
				Ember.Logger.error(data.errorMsg);
			}
			data['endpointInfo'] = endpointInfo;
		});
		return res;
	},
	
	 postData: function(endPointName, extraParams=[], stringify=false) {
       	let self = this;
		let endpointInfo = this.getEndPointInfo(endPointName);
		if(endpointInfo===undefined || endpointInfo===''){
			Ember.Logger.error('Unable to locate API URL:' + endPointName);
			return false;
		}
		
		let apiURL = 'http://localhost:4401/' + endpointInfo.api;		
        var params;
        if(stringify){
            params = JSON.stringify(extraParams);
        }
        else{
            params = self.getRequiredParams(endPointName);
            if(extraParams!==undefined){
				params = self.addExtraParams(extraParams, params);
			}
            if(params['stash']!==undefined){
				apiURL += "/"+params['stash'];
			}
        }

		Ember.Logger.log('Ajax POST Call:', apiURL, params);
		
        let res = Ember.$.ajax({
            url: apiURL,
            data: params,
            type: 'POST',
            dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown) {
                //Ember.Logger.error(textStatus, errorThrown,jqXHR);
            }
        });
        res.then(function (data) {
            if(data.errorMsg!==undefined && data.errorMsg!==''){
                //Ember.Logger.error(data.errorMsg);
            }
            //messages...
        });
        return res;
    }

});