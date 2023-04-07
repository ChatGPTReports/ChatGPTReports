document.getElementById("ceo_qeury_form").addEventListener("submit", function(e){
    e.preventDefault();  

    document.getElementById("loading").style.display="block";
    let query=document.getElementById("ceo_query_input").value;
    console.log(query);

    fetch('local_api/api.php', {
        method: 'POST',
        body:JSON.stringify({query:query})
    }).then(function (response) {
        if (response.ok) {
           return response.text();
           //return response.json();
        }
    }).then(function (data) {
        document.getElementById("loading").style.display="none";
        console.log(data);
        displayResults(data);
    }).catch(function (error) {
        document.getElementById("loading").style.display="none";
        console.warn('Something went wrong.', error);
    });
});

function displayResults(datar){
    let data =JSON.parse(datar);
    if(data.error){
        let htmlError="<div class='error'>"+data.error+"</div>";
        document.getElementById("results_table_holder").innerHTML=htmlError;
    }
    let rows=data.results_table;
    let headers=Object.keys(rows[0]);
    let table="<table id='results_table'>";
        table+="<thead><tr>";
    for(let i = 0; i < headers.length; i++){
        table+="<th>"+headers[i]+"</th>";
    }
    table+="</tr></thead>";
  for(let i = 0; i < rows.length; i++){
        table+="<tr>";
        for(let j = 0; j < headers.length; j++){
        table+="<td>"+rows[i][headers[j]]+"</td>";
        }
        table+="</tr>";
    }
        table+="</table>";

    let html="<div id='export_to_csv'><a href='#' onclick='exportTableToCSV(\"report.csv\")'>Export to CSV</a></div>";
    html+=table;
    let html2="<div id='results_table_holder_inner'>"+html+"</div>";
    document.getElementById("results_table_holder").innerHTML=html2;
}

/*
document.getElementById('export_to_csv').addEventListener('click', function(){
  ;
});
*/

function exportTableToCSV(filename) {
    var csv = [];
    var rows = document.querySelectorAll("#results_table tr");

    var final_rows=[];
  //if(showCertaintyScore){
  //    final_rows.push(["Job Description","Competency","Certainty Score"])
  //}else{
  //    final_rows.push(["Job Description","Competency"])
  //}

    for(var i = 0; i < rows.length; i++){
        var row = [], cols = rows[i].querySelectorAll("td,th");
        for(var j = 0; j < cols.length; j++){
            row.push(cols[j].innerText);
        }
        final_rows.push(row);
       // csv.push(row.join(","));
    }
    console.log(final_rows);

    // download csv file
    exportToCsv(filename,final_rows);
}


function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
}
