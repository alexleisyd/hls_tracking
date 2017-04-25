(function(){
	var app=angular.module('mainApp',['ngAnimate','pascalprecht.translate','ngSanitize']);
    app.config(['$locationProvider','$translateProvider', function($locationProvider, $translateProvider){
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $translateProvider.useSanitizeValueStrategy('escape');

        $translateProvider.translations('en',{
            TITLE:'Customer Delivery Tracking Portal',
            SUBTITLE:'Track a delivery',
            PICKINGSLIP:'Picking Slip',
            PICKINGSLIP_INVALID:'Invalid Picking Slip',
            NOTE:'Please enter the picking slip number and suburb',
            SUBURB:'Suburb',
            SUBURB_INVALID:'Invalid Suburb',
            SUBMIT:'Track',
            CLEAR:'Clear',
            ERROR:'Error',
            NORECORD:'No record found matching the Picking Slip and suburb. Please try again',
            CHECK_ANOTHER:'Check another delivery',
            ORDER_NO:'Order Number',
            STATUS:'Status',
            EXPECTED_DATE:'Expected Date',
            SCHEDULE:'Schedule',
            STEP_1:'Order Received',
            STEP_2:'Order Prepared',
            STEP_3:'Delivery Scheduled',
            STEP_4:'Order Dispatched',
            STEP_5:'Order Delivered'
        }).translations('cn',{
            TITLE:'物流追踪查询平台',
            SUBTITLE:'查询订单',
            PICKINGSLIP:'订单号',
            PICKINGSLIP_INVALID:'订单号无效',
            NOTE:'请输入订单号及地区名查询',
            SUBURB:'地区',
            SUBURB_INVALID:'区名无效',
            SUBMIT:'查询',
            CLEAR:'清除',
            ERROR:'错误',
            NORECORD:'未找到符合订单号及区名的记录。请重试。',
            CHECK_ANOTHER:'查询另一个订单',
            ORDER_NO:'订单号',
            STATUS:'状态',
            EXPECTED_DATE:'预计送达',
            SCHEDULE:'日程',
            STEP_1:'订单确认',
            STEP_2:'订单就绪',
            STEP_3:'送货排期',
            STEP_4:'订单发货',
            STEP_5:'订单送达'
        });
        $translateProvider.preferredLanguage('en');

    }]);

	app.controller('mainCtrl',['$http','$location','$translate',function($http,$location,$translate){
        var ctrl=this;
        ctrl.language='en';


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
                url: 'http://tracking.humeplaster.com.au:8080/HLS-REST/tracking?pickingSlip='+encodeURIComponent(ctrl.pickingSlip)+"&suburb="+encodeURIComponent(ctrl.suburb),
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

        ctrl.updateLanguage = function(lan){
            $translate.use(lan);
        }

        if (ctrl.pickingSlip === undefined && ctrl.suburb === undefined){

        } else {
            ctrl.getData();
        }


    }]);
})();