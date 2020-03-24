google.charts.load('current', {packages: ['geochart'], 'mapsApiKey': ["MAPSAPIKEY"]}); //load different packages for timeseries?
const countriesUrl = "http://localhost:3000/all_data"; //will change to /countries/

const getCountryData = () => {
    fetch(countriesUrl)
    .then(res => res.json())
    .then(countries => {
        const map_array = [['Country', 'Number of Cases']];
        const modal_array = [];
        
        countries.forEach(country => {
            let exists = false;
            map_array.forEach(row => {
                if (country["Country/Region"] === row[0]){
                    exists = true;
                }
            });
            if (!exists){
                let map_row = [country["Country/Region"], parseInt(country["Confirmed"])];
                let modal_row = [country["Country/Region"], parseInt(country["Confirmed"]), parseInt(country["Deaths"]), parseInt(country["Recovered"])]

                if (map_row[1] > 0){
                    map_array.push(map_row);
                    modal_array.push(modal_row);
                }
            }
        });

        //draws map after data
        drawRegionsMap(map_array, modal_array);
    
        })
        .catch(err => console.log(err));
}

const drawRegionsMap = (display_array, data_array) => {
    let data = google.visualization.arrayToDataTable(display_array);
    let options = {
        colorAxis: {minValue: 0,  colors: ['#34e8eb', '#3d34eb']}
    };
    let chart = new google.visualization.GeoChart(document.getElementById('map'));

    const selectHandler = () => {
       let selectedCountry = chart.getSelection()[0];

       if (selectedCountry) {
            let value = data.getValue(selectedCountry.row, 0);
            const modal = document.getElementById("modal-1")
            modal.checked = true;

            const renderModal = () => {
                const h4 = document.querySelector("#region-modal-title");
                const cases = document.querySelector("#modal-cases");
                const deaths = document.querySelector("#modal-deaths");
                const recovered = document.querySelector("#modal-recovered");
                h4.innerHTML = value;
                const current_country = data_array.find(country => country[0] === value);
                cases.innerHTML = current_country[1];
                deaths.innerHTML = current_country[2];
                recovered.innerHTML = current_country[3];
                
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
       }
    }

    google.visualization.events.addListener(chart, 'select', selectHandler);
    
    chart.draw(data, options);
}

getCountryData();
// google.charts.setOnLoadCallback(drawRegionsMap);


    
