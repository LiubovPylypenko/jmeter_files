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
    cell.colSpan = 7;
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

    var data = {"OkPercent": 7.071494210623047, "KoPercent": 92.92850578937696};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07071494210623047, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.05206894787990384, 500, 1500, "Get Characters"], "isController": false}, {"data": [0.07495869907048029, 500, 1500, "Delete Character"], "isController": false}, {"data": [0.07572457403829264, 500, 1500, "Get Character"], "isController": false}, {"data": [0.08039978609231223, 500, 1500, "Create Character"], "isController": false}, {"data": [0.07206184972209935, 500, 1500, "Modify Character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 272050, 252812, 92.92850578937696, 6457.641021871172, 0, 138741, 1891.0, 64814.0, 65630.0, 108057.0, 1095.4915920365954, 14030.542525424224, 167.24358738010196], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get Characters", 58653, 55599, 94.79310521200962, 14717.748759654129, 0, 138741, 4050.0, 135435.8, 136548.95, 137969.96000000002, 236.1840409767412, 13575.729052573932, 30.21359386828732], "isController": false}, {"data": ["Delete Character", 50241, 46475, 92.50413009295197, 3491.0158436336656, 0, 132249, 3244.5, 8677.0, 30016.0, 66788.70000000004, 226.49649712827633, 112.3256788081896, 35.43582006137915], "isController": false}, {"data": ["Get Character", 56930, 52619, 92.42754259617074, 6091.367082381883, 0, 132249, 4041.0, 30161.0, 64816.0, 65585.0, 255.97100823711378, 134.0444481187165, 34.82971048703284], "isController": false}, {"data": ["Create Character", 54229, 49869, 91.96002139076877, 3544.803020524089, 0, 132250, 3108.0, 15824.800000000003, 30019.0, 33155.0, 244.20107445050368, 132.58157747014414, 42.23425355579622], "isController": false}, {"data": ["Modify Character", 51997, 48250, 92.79381502779006, 3445.5130872934988, 0, 132249, 3229.5, 9645.0, 30015.0, 65008.98, 234.28615198839313, 129.6585099920924, 40.74983779253666], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 272050, 252812, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 13839, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 13708, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11156, "The operation lasted too long: It took 524 milliseconds, but should not have lasted longer than 300 milliseconds.", 318, "The operation lasted too long: It took 523 milliseconds, but should not have lasted longer than 300 milliseconds.", 301], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get Characters", 58653, 55599, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 5488, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2719, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2108, "The operation lasted too long: It took 484 milliseconds, but should not have lasted longer than 300 milliseconds.", 65, "The operation lasted too long: It took 2,339 milliseconds, but should not have lasted longer than 300 milliseconds.", 64], "isController": false}, {"data": ["Delete Character", 50241, 46475, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2859, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1689, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1455, "The operation lasted too long: It took 517 milliseconds, but should not have lasted longer than 300 milliseconds.", 85, "The operation lasted too long: It took 4,798 milliseconds, but should not have lasted longer than 300 milliseconds.", 80], "isController": false}, {"data": ["Get Character", 56930, 52619, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3351, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2439, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 1555, "The operation lasted too long: It took 519 milliseconds, but should not have lasted longer than 300 milliseconds.", 69, "The operation lasted too long: It took 479 milliseconds, but should not have lasted longer than 300 milliseconds.", 67], "isController": false}, {"data": ["Create Character", 54229, 49869, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2962, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2796, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1841, "The operation lasted too long: It took 535 milliseconds, but should not have lasted longer than 300 milliseconds.", 101, "The operation lasted too long: It took 578 milliseconds, but should not have lasted longer than 300 milliseconds.", 84], "isController": false}, {"data": ["Modify Character", 51997, 48250, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 2860, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2414, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2167, "The operation lasted too long: It took 425 milliseconds, but should not have lasted longer than 300 milliseconds.", 93, "The operation lasted too long: It took 454 milliseconds, but should not have lasted longer than 300 milliseconds.", 89], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});