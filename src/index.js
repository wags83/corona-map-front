google.charts.load('current', {packages: ['geochart'], 'mapsApiKey': ['MAPSAPIKEY']}); //load different packages for timeseries?
const countriesUrl = "http://localhost:3000/all_data"; //will change to /countries/

const getCountryData = () => {
    fetch(countriesUrl)
    .then(res => res.json())
    .then(countries => {
        const countries_array = [['Country', 'Number of Cases']];
        
        countries.forEach(country => {
            let exists = false;
            countries_array.forEach(row => {
                if (country["Country/Region"] === row[0]){
                    exists = true;
                }
            });
            if (!exists){
                let country_row = [country["Country/Region"], parseInt(country["Confirmed"])];

                if (country_row[1] > 0){
                    countries_array.push(country_row);
                }
            }
        });

        drawRegionsMap(countries_array);
        console.log(countries_array)
        })
        .catch(err => console.log(err));
}

const drawRegionsMap = (array) => {
    let data = google.visualization.arrayToDataTable(array);
    let options = {
        colorAxis: {minValue: 0,  colors: ['#34e8eb', '#3d34eb']}
    };
    let chart = new google.visualization.GeoChart(document.getElementById('map'));
    
    chart.draw(data, options);
    
    google.visualization.events.addListener(chart, 'ready', () => {
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
        })
}

getCountryData();
// google.charts.setOnLoadCallback(drawRegionsMap);


    
