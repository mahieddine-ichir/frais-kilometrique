var totalValue = Number(0.);
var date;
var excelData = [];
var trajets = [];
var monthData;

function removeActionComponent(i) {
  return "<a href='#' onclick='remove("+i+")'>" +
    "<i class='material-icons md-light excludeThisClass'>close</i></a>";
}

function addComponent(i) {
  return "<a href='#' onclick='add("+i+")'>" +
    "<i class='material-icons md-light excludeThisClass'>check</i></a>";
}

function remove(index) {
  var distance = Number(document.getElementById('value_'+index).innerHTML);
  document.getElementById('trajet_'+index).innerHTML = '';
  document.getElementById('value_'+index).innerHTML = '';
  document.getElementById('line_'+index).classList.add('off');
  document.getElementById('action_'+index).innerHTML = addComponent(index);

  totalValue = totalValue - distance * 2;
  document.getElementById('mois_value').innerHTML = ' ('+totalValue+' km)';
  excelData[index].exclude = true;
  monthData[index].working = false;
}

function computeTable(month, currentMontData) {
  console.log(currentMontData);
  var date = new Date();
  date.setMonth(month);

  var moisString = date.toLocaleDateString("fr-FR", {month: 'long', year: 'numeric'});

  var elementById = document.getElementById("mois");
  elementById.innerHTML = moisString + "<span id='mois_value'></span>";

  var lignes = document.getElementById("lignes");
  lignes.innerHTML = '';

  totalValue = Number(0.);

  // to start at 0
  excelData.push({
    exclude: true
  });
  if (!monthData) {
    monthData.push({});
  }

  var trajet;

  for (var i=1; i<=31; i++) {

    date.setDate(i);
    if (i == 1) {
      currentMonth = date.getMonth();
    }
    if (currentMonth != date.getMonth()) {
      break;
    }
    if (currentMontData) {
      trajet = currentMontData.trajet;
    } else {
      trajet = trajets[0];
    }
    console.log(trajet);
    var isWeekend = (date.getDay() == 0 || date.getDay() == 6);
    if (isWeekend) {
      lignes.innerHTML += weekend(date);
    } else {
      lignes.innerHTML += working(date, i, trajet.distance);
      totalValue += 2 * Number(trajet.distance);
    }

    if (! currentMontData) {
      monthData.push({
        day: date.getDay(),
        month: date.getMonth(),
        year: date.getFullYear(),
        trajet: trajet,
        working: !isWeekend
      });
    }

    excelData.push({
      date: date.toLocaleDateString({day: 'numeric', month: 'long', year: 'numeric'}),
      trajet: trajet.name,
      distance: trajet.distance * 2,
      exclude: isWeekend
    });
  } // for i
  totalValue = totalValue.toFixed(2);
}

function weekend(date) {
  return "<tr class='weekend excludeThisClass'>" +
    "<td>"+date.toLocaleDateString("fr-FR", {day: 'numeric', month: 'long', year: 'numeric'})+"</td>" +
    "<td></td>" +
    "<td></td>"+
    "<td></td>"+
    "</tr>";
}

function indexOf(arr, fn) {
  for (var i=0; i<arr.length; i++) {
    if (fn(arr[i])) {
      return i;
    }
  }
  return -1;
}

function find(arr, fn) {
  for (var i=0; i<arr.length; i++) {
    if (fn(arr[i])) {
      return arr[i];
    }
  }
  return null;
}

function map(arr, fn) {
  var out = [arr.length];
  for (var i=0; i<arr.length; i++) {
    out[i] = fn(arr[i]);
  }
  return out;
}

function optionSelected(index) {
  //old value
  var trajetName = document.getElementById('trajetoption_'+index).value;
  var trajet = find(trajets, function(d) {
    return d.name == trajetName;
  });
  var distance = Number(trajet.distance);
  var oldDistance = Number(document.getElementById('value_'+index).innerHTML);
  document.getElementById('value_'+index).innerHTML = distance;
  totalValue = Number(totalValue) + 2 * Number(distance - oldDistance);
  totalValue = totalValue.toFixed(2)
  document.getElementById('mois_value').innerHTML = ' ('+totalValue+' km)';

  // update excel data
  excelData[index].trajet = trajet.name;
  excelData[index].distance = distance * 2;

  monthData[index].trajet = trajet;
}

function optionsTrajet(index) {
  var options = '<select id="trajetoption_'+index+'" onchange="optionSelected('+index+')">';
  for (var i=0; i<trajets.length; i++) {
    options += '<option value="'+trajets[i].name+'">'+trajets[i].name+'</option>';
  }
  options += '</select>';
  return options;
}

function working(date, i, value) {
  return "<tr id='line_"+i+"'>" +
    "<td>"+date.toLocaleDateString("fr-FR", {day: 'numeric', month: 'long', year: 'numeric'})+"</td>" +
    "<td id='trajet_"+i+"'>"+optionsTrajet(i)+"</td>" +
    "<td id='value_"+i+"'>"+value+"</td>"+
    "<td id='action_"+i+"'>"+removeActionComponent(i)+"</td>"+
    "</tr>";
}

function previous() {
  currentMonth--;
  computeTable(currentMonth);
  document.getElementById('mois_value').innerHTML = ' ('+totalValue+' km)';
}

function next() {
  currentMonth++;
  computeTable(currentMonth);
  document.getElementById('mois_value').innerHTML = ' ('+totalValue+' km)';
}

function add(index) {

  var distance = Number(trajets[0].distance);
  document.getElementById('trajet_'+index).innerHTML = optionsTrajet(index);
  document.getElementById('value_'+index).innerHTML = distance;
  document.getElementById('line_'+index).classList.remove('off');
  document.getElementById('action_'+index).innerHTML = removeActionComponent(index);

  totalValue += distance * 2;
  document.getElementById('mois_value').innerHTML = ' ('+totalValue+' km)';
  excelData[index].exclude = false;
  monthData[index].working = true;
}

function exportToExcel() {
  $("#frais").toExcel({
    sheetName : date.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'}),
    fileName : "frais-kilometrique.xls",
    headers: [
      {key: 'date', name: 'Date', type: 'String'},
      {key: 'trajet', name: 'Trajet Client'},
      {key: 'distance', name: 'Distance en KM (Aller/Retour)', type: 'Number'}
    ],
    data: excelData
  });
}

function trajetLine() {
  return '<tr>' +
    '<td><input id="trajet_new_name" style="width:100%;" type="text" placeholder="Trajet Domicile / Client"></td>' +
    '<td><input id="trajet_new_distance" style="width:100%;" type="number" placeholder="Distance en km"></td>' +
    '<td class="text-center"><a onclick="addTrajet()"><i class="material-icons md-light">check</i></a></td>' +
    '</tr>';
}

function initTrajet(trajet, index) {
  return '<tr>' +
      '<td><input id="config_trajet_name_'+index+'" type="text" style="width:100%;"  value="'+trajet.name+'"></td>' +
      '<td><input id="config_trajet_distance_'+index+'" type="number" style="width:100%;" value="'+trajet.distance+'"></td>' +
      //'<td><a onclick="removeTrajet('+trajet+')"><i class="material-icons md-light">delete</i></a></td>' +
      '<td><a onclick="saveTrajet('+index+')"><i class="material-icons md-light">check</i></a></td>' +
      '</tr>';
}

$.fn.addTrajetLine = function() {
  this.each(function() {
    this.innerHTML += trajetLine();
  });
};

$.fn.initTrajets = function(trajets) {
  this.each(function() {
    for (var i=0; i<trajets.length; i++) {
      this.innerHTML += initTrajet(trajets[i], i);
    }
  });
}

function addTrajetLine() {
  $("#config_trajets > tbody").addTrajetLine();
}

function saveTrajet(index) {
  trajets[index].name = document.getElementById("config_trajet_name_"+index).value;
  trajets[index].distance = Number(document.getElementById("config_trajet_distance_"+index).value);

  updateOnTrajets();
  saveToLocal(trajets);
}

function addTrajet() {
  if (!trajets) {
    trajets = [];
  }
  trajets.push({
    name: document.getElementById("trajet_new_name").value,
    distance: Number(document.getElementById("trajet_new_distance").value),
  });
  if (window.localStorage) {
    window.localStorage.setItem("trajets", JSON.stringify(trajets));
  }
  updateOnTrajets();
}

function updateOnTrajets() {
  date = new Date();
  var currentMonth = date.getMonth();
  var currentMonthData;
  /*
  if (monthData && monthData.length > 0) {
    var currentMonthData = find(monthData, function(el) {
      return el.month == date.getMonth() && el.year == date.getFullYear();
    });
  }*/

  computeTable(currentMonth, currentMonthData);
  document.getElementById('mois_value').innerHTML = ' ('+totalValue+' km)';
}

function saveToLocal(trajets) {
  if (window.localStorage) {
    window.localStorage.setItem("trajets", JSON.stringify(trajets));
  }
}

function saveMonth() {
  if (window.localStorage) {
    window.localStorage.setItem("data", JSON.stringify(monthData));
  }
}

$(document).ready(function() {

  if (window.localStorage) {
    trajets = JSON.parse(window.localStorage.getItem("trajets"));
    monthData = JSON.parse(window.localStorage.getItem("data"));
  }

  if (trajets && trajets.length > 0) {
    updateOnTrajets();

    $("#config_trajets > tbody").initTrajets(trajets);
  }

});
