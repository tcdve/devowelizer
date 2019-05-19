/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 6;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 80.00239947211614, "KoPercent": 19.997600527883865};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [7.998240387114835E-5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Test with Empty string and stringSize 0"], "isController": false}, {"data": [0.0, 500, 1500, "Performance test with stringSize 500"], "isController": false}, {"data": [0.0, 500, 1500, "Test with Capital vowels and stringSize 5"], "isController": false}, {"data": [1.0, 500, 1500, "Test with The whole alphabet capital letters and stringSize 26"], "isController": false}, {"data": [0.0, 500, 1500, "Test with Only numbers and stringSize 10"], "isController": false}, {"data": [0.0, 500, 1500, "Performance test with stringSize 1000"], "isController": false}, {"data": [1.0, 500, 1500, "Test with The whole alphabet lower case and stringSize 26"], "isController": false}, {"data": [0.0, 500, 1500, "Performance test with stringSize 50"], "isController": false}, {"data": [0.0, 500, 1500, "Test with UltraLong String and stringSize 8075"], "isController": false}, {"data": [0.0, 500, 1500, "Test with Only non-vowels and stringSize 21"], "isController": false}, {"data": [0.0, 500, 1500, "Test with Vowels with \'y\' included and stringSize 6"], "isController": false}, {"data": [0.0, 500, 1500, "Test with Only vowels with small letters and stringSize 5"], "isController": false}, {"data": [0.0, 500, 1500, "Test with LongString and stringSize 512"], "isController": false}, {"data": [1.0, 500, 1500, "Server status initial check"], "isController": false}, {"data": [0.0, 500, 1500, "Performance test with stringSize 10"], "isController": false}, {"data": [0.0, 500, 1500, "Performance test with stringSize 100"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50011, 10001, 19.997600527883865, 4051.7233008737962, 3, 5642, 5060.0, 5074.0, 5102.0, 22.109107435027887, 9.842617710075425, 9.692794104709575], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Test with Empty string and stringSize 0", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 90.9090909090909, 19.886363636363637, 10.475852272727273], "isController": false}, {"data": ["Performance test with stringSize 500", 9986, 2045, 20.478670138193472, 4028.0720008011226, 3, 5567, 5104.0, 5127.0, 5165.129999999999, 4.482028573493195, 2.541146496995748, 2.704974275799604], "isController": false}, {"data": ["Test with Capital vowels and stringSize 5", 1, 0, 0.0, 2517.0, 2517, 2517, 2517.0, 2517.0, 2517.0, 0.3972983710766786, 0.08070123162495034, 0.04772236293206198], "isController": false}, {"data": ["Test with The whole alphabet capital letters and stringSize 26", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 142.85714285714286, 31.25, 16.46205357142857], "isController": false}, {"data": ["Test with Only numbers and stringSize 10", 1, 0, 0.0, 5011.0, 5011, 5011, 5011.0, 5011.0, 5011.0, 0.19956096587507485, 0.04190000748353622, 0.025140004490121732], "isController": false}, {"data": ["Performance test with stringSize 1000", 9961, 2035, 20.429675735367933, 4030.7381788977063, 4, 5632, 5105.0, 5125.0, 5169.379999999999, 4.490972743524023, 4.151371918401897, 4.903230007089705], "isController": false}, {"data": ["Test with The whole alphabet lower case and stringSize 26", 1, 0, 0.0, 25.0, 25, 25, 25.0, 25.0, 25.0, 40.0, 9.609375, 5.625], "isController": false}, {"data": ["Performance test with stringSize 50", 10010, 1922, 19.2007992007992, 4092.296503496515, 3, 5596, 5106.0, 5128.0, 5168.0, 4.529383071781446, 1.10595267651585, 0.7431019102141434], "isController": false}, {"data": ["Test with UltraLong String and stringSize 8075", 1, 1, 100.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 29.41176470588235, 59.771369485294116, 0.0], "isController": false}, {"data": ["Test with Only non-vowels and stringSize 21", 1, 0, 0.0, 5026.0, 5026, 5026, 5026.0, 5026.0, 5026.0, 0.19896538002387584, 0.043912281138081974, 0.02700799592120971], "isController": false}, {"data": ["Test with Vowels with \'y\' included and stringSize 6", 1, 0, 0.0, 3608.0, 3608, 3608, 3608.0, 3608.0, 3608.0, 0.2771618625277162, 0.05521583980044346, 0.03356256929046563], "isController": false}, {"data": ["Test with Only vowels with small letters and stringSize 5", 1, 0, 0.0, 2512.0, 2512, 2512, 2512.0, 2512.0, 2512.0, 0.3980891719745223, 0.07891806827229299, 0.04781735171178344], "isController": false}, {"data": ["Test with LongString and stringSize 512", 1, 0, 0.0, 5028.0, 5028, 5028, 5028.0, 5028.0, 5028.0, 0.1988862370723946, 0.11944827714797138, 0.12236164976133652], "isController": false}, {"data": ["Server status initial check", 1, 0, 0.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 21.27659574468085, 5.111369680851064, 2.5764627659574466], "isController": false}, {"data": ["Performance test with stringSize 10", 10102, 2002, 19.817857849930707, 4061.1643238962674, 3, 5642, 5105.0, 5127.0, 5168.0, 4.571024177288046, 0.9785942729053471, 0.5713780221610057], "isController": false}, {"data": ["Performance test with stringSize 100", 9941, 1996, 20.078462931294638, 4048.146866512431, 4, 5591, 5105.0, 5126.0, 5167.0, 4.485984513628756, 1.2559379411075207, 0.9550240468467469], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500\/Internal Server Error", 10000, 99.9900009999, 19.995600967787087], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: localhost:8080 failed to respond", 1, 0.009999000099990002, 0.001999560096778709], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50011, 10001, "500\/Internal Server Error", 10000, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: localhost:8080 failed to respond", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Performance test with stringSize 500", 9986, 2045, "500\/Internal Server Error", 2045, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Performance test with stringSize 1000", 9961, 2035, "500\/Internal Server Error", 2035, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Performance test with stringSize 50", 10010, 1922, "500\/Internal Server Error", 1922, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Test with UltraLong String and stringSize 8075", 1, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: localhost:8080 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Performance test with stringSize 10", 10102, 2002, "500\/Internal Server Error", 2002, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Performance test with stringSize 100", 9941, 1996, "500\/Internal Server Error", 1996, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
