google.charts.load('current', {packages: ['geochart'], 'mapsApiKey':'AIzaSyAo8uyaqeibAp9SynVtLbVnuO1LjzaBnDI'});

const drawRegionsMap = () => {
    let data = google.visualization.arrayToDataTable([
        ['Country', "Popularity"]
    ]);
    let options = {};
    let chart = new google.visualization.GeoChart(document.getElementById('map'));
    
    chart.draw(data, options);
}

google.charts.setOnLoadCallback(drawRegionsMap);