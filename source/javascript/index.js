/*global google */
/*global moment */
/*global $ */
var currentPosition = '';
var latitulong = '';
var user = '';
var map;
var n = 1;
var map2;
var oldDate = '';
var pos = 1;
var mark;
function loadCurrentWeather(weather) { //funzione caricamento homepage con binding e popolazione localStorage se disponibile
    'use strict';
    try { //controllo eccezzione localStorage inserito per Safari 
        if (localStorage && localStorage.ultimoaccesso) {
            oldDate = localStorage.ultimoaccesso;
        } else {
            oldDate = "MAI";
        }
        localStorage.setItem('ultimoaccesso', moment().format('LL') + ' ' + moment().format('LTS'));
        if (localStorage && localStorage.username) {
            user = localStorage.username;
        } else {
            user = 'Mario';
            localStorage.username = user;
        }
    }
    catch (err) {
        console.log(err);
        user = 'Mario';
        oldDate = "Non Disponibile";
    }
    finally { //esecuzione binding HOME
        var arrayId = ['nome', 'accesso', 'icona', 'temp', 'wind', 'cloudiness', 'pressure', 'humidity', 'sunrise', 'sunset'];
        var arrayValue = [user, oldDate, weather.weather[0].icon, weather.main.temp, weather.wind, weather.weather[0].description, weather.main.pressure, weather.main.humidity, weather.sys.sunrise, weather.sys.sunset];
        for (var i = 0; i < arrayId.length; i++) {
            load(arrayId[i], arrayValue[i]);
        }
    }
    $('.loader').fadeOut(); //nascondo loading
}
function addRow(array) { //funzione creazione righe tabella
    'use strict';
    var tr = $(document.createElement('tr'));
    $(tr).addClass('forecast');
    for (var i = 1; i < array.length; i++) {
        if (i === 1) {
            $(tr).append('<th scope="row" id="' + array[i] + '" class="text-center"></th>');
        }
        else {
            if (array[i].slice(0, 6) === 'ficona') {
                $(tr).append('<td class="text-center"><img id="' + array[i] + '"></img></td>');
            } else {
                $(tr).append('<td id="' + array[i] + '" class="text-center"></td>');
            }
        }
    }
    return tr;
}
function addRowTh(array) { //funzione creazione testa tabella
    'use strict';
    var tr = $(document.createElement('tr'));
    $(tr).addClass('forecast bg-inverse text-white');
    for (var i = 0; i < array.length; i++) {
        $(tr).append('<th id="' + array[i] + '" class="text-center"></th>');
    }
    return tr;
}
function backForward(direction) { //funzione di fadeIn/Out tabelle forecast con controllo booleano
    'use strict';
    if (direction) {
        if (pos < n) {
            $('#btBack').prop('disabled', false);
            $('.num-' + pos).fadeOut(300, function () {
                $('.num-' + pos).fadeIn();
            });
            $('#data' + pos).hide();
            pos++;
            $('#data' + pos).show();
            if (pos === n) {
                $('#btForward').prop('disabled', true);
            }
        }
    }
    else {
        if (pos > 1) {
            $('#btForward').prop('disabled', false);
            $('.num-' + pos).fadeOut(300, function () {
                $('.num-' + pos).fadeIn();
            });
            $('#data' + pos).hide();
            pos--;
            // $('.num-' + pos).show();
            $('#data' + pos).show();
            if (pos === 1) {
                $('#btBack').prop('disabled', true);
            }
        }
    }
}
function loadForecast(forecast) {//funzione di caricamento forecast dove crea tutte le tabelle e le nasconde tranne la prima, 
    'use strict';
    var weather;
    n = 1;
    pos = 1;
    var tr;
    var oldDay = {
        date: moment.unix(forecast.list[0].dt).format('L'),
        index: 0,
    };
    $('article').remove('#contForecast');
    $('div').remove('#headForecast');
    var article = $(document.createElement('article'));
    $(article).attr('id', 'contForecast');
    var head = $(document.createElement('div'));
    $(head).attr('id', 'headForecast');
    $(head).addClass('modal-title col order-first');
    $('#dateHeader').append(head);
    $('#contTable').append(article);
    console.log(forecast.list.length - 1);
    var dimList = forecast.list.length - 1;
    while (oldDay.index < dimList) {    //ciclo creazione tabelle
        var h3 = $(document.createElement('h5'));
        $(h3).attr('id', 'data' + n);
        $('#headForecast').append(h3);
        $(h3).hide();
        load('data' + n, forecast.list[oldDay.index].dt, n);
        var table = $(document.createElement('table'));
        $(table).addClass('num-' + n + ' table table-hover');
        $(article).append(table);
        $(table).hide();
        var arrayTh = ['ora' + n, 'fenomeno' + n, 'tempo' + n, 'temperatura' + n];
        var arrayValueTh = ['Ora', 'Fenomeno', 'Tempo', 'Temperatura'];
        var thead = $(document.createElement('thead'));
        $(table).append(thead);
        $(thead).append(addRowTh(arrayTh)); //ciclo creazione testa tabella
        for (var i = 0; i < arrayTh.length; i++) {
            load(arrayTh[i], arrayValueTh[i], oldDay.index);
        }
        n++;
        weather = forecast.list[oldDay.index];

        while (oldDay.date === moment.unix(weather.dt).format('L')) { //ciclo creazione righe tabella
            if (oldDay.index <= 39) {
                oldDay.date = moment.unix(weather.dt).format('L');
                weather = forecast.list[oldDay.index];
                var arrayId = ['data', 'time' + oldDay.index, 'ficona' + oldDay.index, 'fcloudiness' + oldDay.index, 'ftemp' + oldDay.index];
                var arrayValue = [weather.dt, weather.dt, weather.weather[0].icon, weather.weather[0].description, weather.main.temp];
                tr = addRow(arrayId);
                var tbody = $(document.createElement('tbody'));
                $(table).append(tbody);
                $(tbody).append(tr);
                for (i = 1; i < arrayId.length; i++) {
                    load(arrayId[i], arrayValue[i], oldDay.index);
                }
                oldDay.index++;
            }
            else {
                weather = forecast.list[oldDay.index - 1];
                oldDay.date = '';
            }
        }
        oldDay.date = moment.unix(weather.dt).format('L');
    }
    n--;
    $('#btBack').prop('disabled', true);
    $('#btForward').prop('disabled', false);
    $('.num-1').show();
    $('#data1').show();
}
function findPosition(position) {
    'use strict';
    var mapProp;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': position }, function (results, status) {
        if (status === 'OK') {
            mapProp = {
                center: results[0].geometry.location,
                zoom: 10,
            };
            map = new google.maps.Map(document.getElementById("mappa"), mapProp);
            mark = new google.maps.Marker({
                position: mapProp.center,
                map: map
            });
            map2 = new google.maps.Map(document.getElementById("mappa2"), mapProp);
            mark = new google.maps.Marker({
                position: mapProp.center,
                map: map2
            });
            latitulong = mapProp.center;
            var name = document.getElementById('geoCoords');
            name.innerText = latitulong.lat().toFixed(2) + ', ' + latitulong.lng().toFixed(2);
            var luogo = document.getElementById('luogo');
            luogo.innerText = results[0].formatted_address;
            $.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + latitulong.lat() + '&lon=' + latitulong.lng() + '&lang=it&APPID=ee6b293d773f4fcd7e434f79bbc341f2', loadCurrentWeather);
            $.getJSON('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitulong.lat() + '&lon=' + latitulong.lng() + '&lang=it&APPID=ee6b293d773f4fcd7e434f79bbc341f2', loadForecast);
        } else {
            alert('Nessun Risultato');
            $('#myModal').modal('show');
        }
    });
}

function noGeolocation() {//se la localizzazione viene bloccata, apri modale search
    'use strict';
    loadMap();
    $('.loader').fadeOut();
    enableMarker();
    $("#myModal").modal();
}
function loadMap(position) {//funzione caricamento mappe
    'use strict';
    var mapProp;
    if (position && position.coords) {
        var latitudine = position.coords.latitude;
        var longitudine = position.coords.longitude;
        mapProp = {
            center: new google.maps.LatLng(latitudine, longitudine),
            zoom: 10,
        };
    } else {
        mapProp = {
            center: new google.maps.LatLng(42.94, 12.55),
            zoom: 5,
        };
    }
    latitulong = mapProp.center;
    var name = document.getElementById('geoCoords');
    name.innerText = latitulong.lat().toFixed(2) + ', ' + latitulong.lng().toFixed(2);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': mapProp.center }, function (results) {
        if (results[0]) {
            currentPosition = results[0].formatted_address;
            var luogo = document.getElementById('luogo');
            luogo.innerText = currentPosition;
        } else {
            alert('No Result');
        }
    });
    map = new google.maps.Map(document.getElementById("mappa"), mapProp);
    mark = new google.maps.Marker({
        position: mapProp.center,
        map: map
    });
    map2 = new google.maps.Map(document.getElementById("mappa2"), mapProp);
    mark = new google.maps.Marker({
        position: mapProp.center,
        map: map2
    });
    $.getJSON('https://api.openweathermap.org/data/2.5/weather?lat=' + latitulong.lat() + '&lon=' + latitulong.lng() + '&lang=it&APPID=ee6b293d773f4fcd7e434f79bbc341f2', loadCurrentWeather);
    $.getJSON('https://api.openweathermap.org/data/2.5/forecast?lat=' + latitulong.lat() + '&lon=' + latitulong.lng() + '&lang=it&APPID=ee6b293d773f4fcd7e434f79bbc341f2', loadForecast);
}
function load(id, value, j) {//funzione di binding
    'use strict';
    var name = document.getElementById(id);
    switch (id) {
        case 'icona': case 'ficona' + j:
            name.src = 'https://openweathermap.org/img/w/' + value + '.png';
            break;
        case 'temp': case 'ftemp' + j:
            var temp = value - 273.15;
            name.innerText = temp.toFixed(1) + '°C';
            break;
        case 'wind':
            if (value.deg === undefined) {
                name.innerText = 'calmo';
            } else {
                name.innerText = ' ' + value.speed + ' m/s,  (' + value.deg + ')';
            }
            break;
        case 'sunrise': case 'sunset': case 'time' + j:
            name.innerText = moment.unix(value).format('kk:mm');
            break;
        case 'data' + j:
            name.innerText = moment.unix(value).format('LL');
            break;
        default:
            name.innerText = value;
    }
}
$('#btSearch').click(function () {//chiusura modale search con click su tasto ok
    'use strict';
    $('#myModal').modal('hide');
    findPosition($('#srch-term').val());
});
$("#modalSearch").on('keyup', function (e) { //chiusura modale search con tasto invio
    'use strict';
    if (e.keyCode === 13) {
        $('#myModal').modal('hide');
        findPosition($('#srch-term').val());
    }
});
$('#btForward').click(function () {//al click del bottone avanti avvia funzione con booleano true
    'use strict';
    backForward(true);
});
$('#btBack').click(function () {//al click del bottone indietro avvia funzione con booleano false
    'use strict';
    backForward(false);
});
function enableMarker() {//funzione che setta un nuovo marcatore sulla mappa del modale e cancella il vecchio
    'use strict';
    google.maps.event.addListener(map2, 'click', function (event) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'location': event.latLng }, function (results) {
            if (results[0]) {
                currentPosition = results[0].formatted_address;
                $('#srch-term').val(currentPosition); //binding posizione ricavata dal nuovo marcatore 
                mark.setMap(null);
                mark = new google.maps.Marker({
                    position: event.latLng,
                    map: map2
                });
            } else {
                alert('No Result');
            }
        });
    });
}
$('#findPosition').click(function () {//se si preme sul bottone di ricerca abilita la ricerca con il markup sulla mappa
    'use strict';
    enableMarker();
});
function loadPosition() { //carica mappa all'avvio
    'use strict';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(loadMap, noGeolocation);
    } else {
        noGeolocation();
    }
}
window.addEventListener('load', function () { //avvio funzione dopo il caricamento del DOM
    'use strict';
    loadPosition();
});