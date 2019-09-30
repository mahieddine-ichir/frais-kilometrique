$.fn.toExcel = function(config) {

  var config = config;

  var xcelContent = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="https://www.w3.org/TR/html401/">\n';

  var sheetName = config.sheetName ? config.sheetName : 'Sheet';
  var fileName = config.fileName ? config.fileName : 'file.xls';

  xcelContent += '<Worksheet ss:Name="'+sheetName+'">\n';

  this.each(function() {

    // set content from table
    xcelContent += '<Table>\n';
    //    xcelContent += '<Column ss:Index="1" ss:AutoFitWidth="0" ss:Width="110"/>';

    // header line
    xcelContent += '<Row>\n';
    var headerIndexConfig = [config.headers.length];
    for (var i=0; i<config.headers.length; i++) {
      xcelContent += '<Cell><Data ss:Type="String">'+config.headers[i].name+'</Data></Cell>\n';
      headerIndexConfig[i] = config.headers[i];
    }
    xcelContent += '</Row>\n'

    // data lines
    for (var j=0; j<config.data.length; j++) {
      if (config.data[j].exclude) {
        continue;
      }
      xcelContent += '<Row>\n';
      for (var i=0; i<headerIndexConfig.length; i++) {
        var value = config.data[j][headerIndexConfig[i].key];
        var type = headerIndexConfig[i].type ? headerIndexConfig[i].type : 'String';
        xcelContent += '<Cell><Data ss:Type="'+type+'">'+value+'</Data></Cell>\n';
      }
      xcelContent += '</Row>\n'
    }
    // close table
    xcelContent += '</Table>\n';
    // close sheet
    xcelContent += '</Worksheet>\n </Workbook>\n';

    var blob = new Blob([xcelContent], {type: "application/vnd.ms-excel"});
    window.URL = window.URL || window.webkitURL;
    link = window.URL.createObjectURL(blob);
    a = document.createElement("a");
    a.download = fileName;
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  });

};


