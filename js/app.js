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
            NOREALTIME:'Sorry, no real-time tracking for this order.',
            CHECK_ANOTHER:'Check another delivery',
            ORDER_NO:'Order Number',
            STATUS:'Status',
            EXPECTED_DATE:'Expected Date',
            SCHEDULE:'Schedule',
            STEP_1:'Order Received',
            STEP_2:'Order Prepared',
            STEP_3:'Delivery Scheduled',
            STEP_4:'Order Dispatched',
            STEP_5:'Order Delivered',
            DISTANCE:'Distance',
            DURATION:'Duration',
            REALTIME:'Real-Time Tracking',
            ALERT:'Alert'
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
            NOREALTIME:'抱歉，该订单没有实时位置',
            CHECK_ANOTHER:'查询另一个订单',
            ORDER_NO:'订单号',
            STATUS:'状态',
            EXPECTED_DATE:'预计送达',
            SCHEDULE:'日程',
            STEP_1:'订单确认',
            STEP_2:'订单就绪',
            STEP_3:'送货排期',
            STEP_4:'订单发货',
            STEP_5:'订单送达',
            DISTANCE:'距离',
            DURATION:'预计时长',
            REALTIME:'实时位置',
            ALERT:'警告'
        });
        $translateProvider.preferredLanguage('en');

    }]);

    app.controller('mainCtrl',['$scope','$http','$location','$translate',function($scope,$http,$location,$translate){
        var ctrl=this;
        ctrl.language='en';


        var realtrackingDetail = "";


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

                    console.log("step0:"+ctrl.isStep[i]);
                }


                if (ctrl.entry.step == 4) {

                    $scope.getRealTimeData();
                }

                else{

                    // ctrl.visibleMap = false;
                }
            },function(response){

            });
        };

        //ADD BY MILEY FOR REAL TIME TRACKING

        $scope.getRealTimeData = function () {

            console.log("getting realtime data");

            var reqForMap={
                method: 'GET',
                url: 'http://tracking.humeplaster.com.au:8080/HLS-REST/location/tracking?pickingSlip='+encodeURIComponent(ctrl.pickingSlip)+'&suburb='+encodeURIComponent(ctrl.suburb),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic YWRtaW46YWRtaW4='
                }
            };


            $http(reqForMap).catch(function (response) {

                if(response.status == 404) {


                    // ctrl.visibleMap = false;

                }else{
                    // ctrl.visibleMap = true;
                }

            }).then(function(response){


                var homeIcon = 'https://d13v9yyemqd5pw.cloudfront.net/assets/icon-home-4f34aaeaab82e64a3cdc0361956ed855.svg';
                var truckIcon = 'https://www.shiels.com.au/pub/media/wysiwyg/Truck.png';

                if(!response){


                    $scope.destinationState = $scope.getState();
                    console.log("destinationState"+$scope.destinationState);

                    geocoder.geocode({'address': ctrl.suburb + "," + $scope.destinationState}, function (results, status) {

                        if (status == 'OK') {

                            destination = results[0].geometry.location;
                            var map = new google.maps.Map(document.getElementById("map"), {
                                zoom: 13,
                                center: destination,
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            });


                            console.log("destination:" + destination);

                            // map.setCenter($scope.destination);
                            var markerSuburb = new google.maps.Marker({
                                map: map,
                                position: destination,
                                icon: homeIcon
                            });

                            $scope.distance = "N/A";
                            $scope.duration = "N/A";
                            $scope.$apply();



                        } else {
                            alert('Geocode was not successful for the following reason: ' + status + results);
                        }
                    });



                }
                else {
                    // ctrl.visibleMap = true;

                    var result=response.data;

                    console.log("lat:"+result.latitude+","+"lng:"+result.longitude);

                    document.getElementById("map").style.display = 'block';

                    var origin = new google.maps.LatLng(result.latitude, result.longitude);

                    var map = new google.maps.Map(document.getElementById("map"), {
                        zoom: 13,
                        center: new google.maps.LatLng(result.latitude, result.longitude),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });

                    var markerTruck = new google.maps.Marker({
                        position: new google.maps.LatLng(result.latitude, result.longitude),
                        map: map,
                        icon: truckIcon

                    });

                    $scope.destinationState = $scope.getState();
                    geocoder.geocode({'address': ctrl.suburb + "," + $scope.destinationState}, function (results, status) {
                        if (status == 'OK') {

                            destination = results[0].geometry.location;
                            console.log("destination:" + destination);

                            // map.setCenter($scope.destination);
                            var markerSuburb = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                icon: homeIcon
                            });

                            // $scope.calculateDistance = function(orgin,destination){


                            service.getDistanceMatrix(
                                {
                                    origins: [origin],
                                    destinations: [destination],
                                    travelMode: 'DRIVING'
                                }, callback);

                            function callback(response, status) {
                                if (status == 'OK') {
                                    var result = response.rows[0].elements;
                                    var element = result[0];

                                    $scope.distance = element.distance.text;
                                    $scope.duration = element.duration.text;
                                    $scope.$apply();

                                    console.log("distance:" + $scope.distance);
                                    console.log("duration:" + $scope.duration);

                                }
                            }


                        } else {
                            alert('Geocode was not successful for the following reason: ' + status + results);
                        }
                    });

                }


            },function(response){});

        };

        $scope.getState = function () {

            console.log("slip:" + ctrl.pickingSlip);
            var destinationState;
            var sArray = ctrl.pickingSlip.split("/");
            if (sArray[0] == "PRE" || sArray[0] == "SUN") {
                destinationState = "VIC"
            } else {
                destinationState = "NSW";
            }
            return destinationState;
        };

        ctrl.clear=function(){
            ctrl.initEntry();
            ctrl.pickingSlip='';
            ctrl.suburb='';
            ctrl.isStep=[false,false,false,false,false];


        };

        ctrl.updateLanguage = function(lan){
            $translate.use(lan);
        };



        if (ctrl.pickingSlip === undefined && ctrl.suburb === undefined){

        } else {
            ctrl.getData();
        }


    }]);

})();