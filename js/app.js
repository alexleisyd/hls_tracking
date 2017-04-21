(function(){
	var app=angular.module('mainApp',['ngAnimate']);
    app.config(['$locationProvider', function($locationProvider){
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);
	app.controller('mainCtrl',['$http','$location',function($http,$location){
        var ctrl=this;



        ctrl.initEntry=function(){
            ctrl.error=false;
            ctrl.entry={
                orderNo : 'N/A',
                suburb : 'N/A',
                status : 'N/A',
                expectedDate : 'N/A',
                schedule : 'N/A',
                step : 0,
                timestamps : []
            };
        };

        ctrl.pickingSlip=$location.search().pickingSlip;
        ctrl.suburb=$location.search().suburb;

        ctrl.initEntry();
        ctrl.isStep=[false,false,false,false,false];

        ctrl.getData=function(){
            //Validation
            if (ctrl.pickingSlip===undefined || ctrl.suburb===undefined){
                return;
            }
            if (ctrl.pickingSlip.length<9 ){
                ctrl.invalidPickingSlip=true;
                return;
            } else {
                ctrl.invalidPickingSlip=false;
            }

            if (ctrl.suburb.length<3 ){
                ctrl.invalidSuburb=true;
                return;
            } else {
                ctrl.invalidSuburb=false;
            }

            var req={
                method: 'GET',
                url: 'http://192.168.3.250:8080/HLS-REST/tracking?pickingSlip='+encodeURIComponent(ctrl.pickingSlip)+"&suburb="+encodeURIComponent(ctrl.suburb),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic YWRtaW46YWRtaW4='
                }
            };

            $http(req).then(function(response){
                var result=response.data;
                if (!result.status){
                    ctrl.error=true;
                    return;
                } else {
                    ctrl.error=false;
                }
                ctrl.entry=result.trackingModel;
                for (var i=1;i<ctrl.entry.step+1;i++){
                    ctrl.isStep[i]=true;
                }
            },function(response){
                console.log(response.status);
            });
        };

        ctrl.clear=function(){
            ctrl.initEntry();
            ctrl.pickingSlip='';
            ctrl.suburb='';
        };

        if (ctrl.pickingSlip === undefined && ctrl.suburb === undefined){

        } else {
            ctrl.getData();
        }


    }]);
})();