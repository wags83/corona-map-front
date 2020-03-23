google.charts.load('current', {packages: ['geochart'], 'mapsApiKey': ['MAPSAPIKEY']});

const drawRegionsMap = () => {
    let data = google.visualization.arrayToDataTable([
        ['Country', "Popularity"]
    ]);
    let options = {};
    let chart = new google.visualization.GeoChart(document.getElementById('map'));
    
    chart.draw(data, options);
}

google.charts.setOnLoadCallback(drawRegionsMap);