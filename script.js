 
            var panel_power=0;
            var panel_tilt=0;
            var panel_azimuth=0;

            var lat;
            var long;
            
            var forecast;
            var sun_info;
            var sid;
            
            function getPowerofSolar(tiltle,tiltle_sun,azimut,azimut_sun,zakr)
            {
                var cf=zakr/100;
                var vysledek=((Math.sin(tiltle)*Math.cos(tiltle_sun)*Math.cos(azimut-azimut_sun))+(Math.cos(tiltle)*Math.sin(tiltle_sun)));
                vysledek=Math.abs(vysledek)*panel_power;
                vysledek=vysledek*cf;
                return vysledek;

            }
            function getUrlForecast()
            {
                var start="https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
                start=start+lat+","+long;
                var end="?unitGroup=metric&key=INSERT_YOUR_KEY_HERE&options=nonulls&include=fcst%2Chours";
                return start+end;

            }
            function generateDataGraph(data,sun_info)
            {
                var head=['Day', 'Power']
                
                var size=data.length;
                var container=new Array(size+1);

                container[0]=head;
                for(var i=1;i<size+1;i++)
                {
                    var temp =new Array(2);
                    temp[0]=data[i-1].datetime;
                    temp[1]=getPowerofSolar(panel_tilt,sun_info[i-1].sun_altitude,panel_azimuth,sun_info[i-1].sun_azimuth,forecast.days[i-1].cloudcover);
                    container[i]=temp;
                }
                return container
            }
            function renderGraph(forecast,sun_info)
            {
                    var data_container=generateDataGraph(forecast.days,sun_info);
                    google.charts.load('current', {'packages':['corechart']});
                    google.charts.setOnLoadCallback(drawChart);

                    function drawChart() {
                        var data = google.visualization.arrayToDataTable(data_container);

                        var options = {
                        title: 'Power(W) by days',
                        curveType: 'function',
                        legend: { position: 'bottom' }
                        };

                        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

                        chart.draw(data, options);
                    }
            }
            function getLocation()
            {
                navigator.geolocation.getCurrentPosition(success, error, options);
            }
                        var options = {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                        };

                        function success(pos) {
                        var crd = pos.coords;

                        var lan=document.getElementById("langtitude");
                        var lon=document.getElementById("longtitude");
                        lan.value=crd.latitude;
                        lon.value=crd.longitude;

                        }

                        function error(err) {
                        console.warn(`ERROR(${err.code}): ${err.message}`);
                        }

            function agregateData()
            {
                var url=getUrlForecast();
            //https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Hukvaldy%2C%2080%2C%20CZ?unitGroup=metric&key=7HEG3REY8NU5HVGCYPY4DT87X&options=nonulls&include=fcst%2Chours
            const settings = {
                                "async": false,
                                "ContentType":'json',
                                "crossDomain": true,
                                "url": url,
                                "method": "GET",
                            };
                            
                            
                            $.ajax(settings).done(function (response) {
                                forecast=response;
                            });
            
            //https://api.ipgeolocation.io/astronomy?apiKey=462f8de2b8934070a8b053d990acc484&location=%20CZ'
            var sun_info_days=new Array(forecast.days.length);
            for(var i=0;i<forecast.days.length;i++)
            {
                var date="&date="+forecast.days[i].datetime;
                const settings2 = {
                                    "async": false,
                                    "ContentType":'json',
                                    "crossDomain": true,
                                    "url": "https://api.ipgeolocation.io/astronomy?apiKey=INSERT_YOUR_KEY_HERE&location=%20CZ"+date,
                                    "method": "GET",
                                };
                                
                                
                                $.ajax(settings2).done(function (response) {
                                    sun_info=response;
                                });
                                sun_info_days[i]=sun_info;
            }
            sid=sun_info_days;

            var days=forecast.days;
            }
            
           function submited(form)
           {
            if(!form.tilt.value || !form.azimuth.value||!form.output.value||!form.langtitude.value || !form.longtitude.value)
            {
                alert("Please fill all data");
                return;
            }
            panel_tilt=parseInt(form.tilt.value);
            if(panel_tilt>360 || panel_tilt<0)
            {
                alert("Wrong tilt");
                return;
            }
            panel_azimuth=parseInt(form.azimuth.value);
            if(panel_azimuth>360 || panel_azimuth<0)
            {
                alert("Wrong azimuth");
                return;
            }
            panel_power=parseInt(form.output.value);
            if(panel_power<=0)
            {
                alert("panel output must be bigger then 0");
                return;
            }
            
            lat=parseFloat(form.langtitude.value);
            long=parseFloat(form.longtitude.value);
            if(lat>90||lat<(-90)){
                alert("Wrong langtitude");
                return;
            }
            if(long>180||lat<(-180)){
                alert("Wrong longitude");
                return;
            }


            
            agregateData();
            renderGraph(forecast,sid);
           
            return false;
           }
