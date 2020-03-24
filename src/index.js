google.charts.load('current', {packages: ['geochart'], 'mapsApiKey': ['MAPSAPIKEY']});

const drawRegionsMap = () => {
    let data = google.visualization.arrayToDataTable([
        ['Country', "Number of Cases"],
        ['US', 45000],
        ['Germany', 23000],
        ['China', 81000]
    ]);
    let options = {
        colorAxis: {minValue: 0,  colors: ['#34e8eb', '#3d34eb']}
    };
    let chart = new google.visualization.GeoChart(document.getElementById('map'));
    
    chart.draw(data, options);


    google.visualization.events.addListener(chart, 'ready', () => [
        google.visualization.events.addListener(chart, 'regionClick', (e) => {
            
            const modal = document.getElementById("modal-1")
            modal.checked = true;
     
            const renderModal = () => {
                const h4 = document.querySelector("#region-modal-title");
                h4.innerHTML = e.region;
                //insert chart renderings and data here 

            }

            renderModal();

            //this will rerender map zoomed into the region clicked and show provinces/states
            // options = {
            //     displayMode:'regions',
            //     region: e.region,
            //     resolution: "provinces"
            // }
            // chart.draw(data, options);
        })


    ]);
}

google.charts.setOnLoadCallback(drawRegionsMap);


    
