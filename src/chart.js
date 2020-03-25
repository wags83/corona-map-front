document.addEventListener("DOMContentLoaded", () => {

    google.charts.load('current', {packages: ['geochart', 'corechart'], 'mapsApiKey': ""}); //load different packages for timeseries?
    const latestUrl = "http:localhost:3000/latest_data";
    const countriesUrl = "http://localhost:3000/countries"; //need to embed countries with current days
    
    //===============  GET COUNTRY FUNCTIONS ========================//
    
    const getCountryData = () => {
        fetch(latestUrl)
        .then(res => res.json())
        .then(countries => {
            const map_array = [['Country', 'Number of Cases']];
            const modal_array = [];
            
            //get country data
            countries.forEach(country => {
            
                let map_row = [country.country.name, country.cases];
                let modal_row = [country.country.name, country.cases, country.deaths, country.recovered, country.country_id];
    
                if (map_row[1] > 0){
                    map_array.push(map_row);
                    modal_array.push(modal_row);
                }
            });
    
            //draws map after data
            drawRegionsMap(map_array, modal_array);
        
        })
        .catch(err => console.log(err));
    }
    
    const getCountryByDaysData = (id) => {
        return fetch(`${countriesUrl}/${id}`)
            .then(res => res.json())
            .then(days => days)
            .catch(err => console.log(err));
    }
    
    
    //===============  DRAW MAP FUNCTION ========================//
    
    
    const drawRegionsMap = (display_array, data_array) => {
        let data = google.visualization.arrayToDataTable(display_array);
        let options = {
            colorAxis: {minValue: 0,  colors: ['#34e8eb', '#3d34eb']},
            legend: {textStyle: {fontName: "Patrick Hand SC", fontSize: 13}},
            tooltip: {textStyle: {fontName: "Patrick Hand SC"}}
        };
        let chart = new google.visualization.GeoChart(document.getElementById('map'));
    
        //what happens on click for each region
        const selectHandler = () => {
           let selectedCountry = chart.getSelection()[0];
    
           if (selectedCountry) {
                let value = data.getValue(selectedCountry.row, 0);
                const modal = document.getElementById("modal-1")
                modal.checked = true;
    
                //===============  RENDER MODEL & LINE CHART FUNCTION ========================//
    
    
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
                    const countryId = current_country[4];
    
                    //get days from country end point
                    const days = Promise.resolve(getCountryByDaysData(countryId));
                
                    days.then(days => {
                        const lineChartArray = [['Day', 'Cases', 'Deaths', 'Recovered']];
    
                        days.forEach(day => {
                            const lineRow = [day.date, day.cases, day.deaths, day.recovered];
                            lineChartArray.push(lineRow);
                        })
    
                        let lineData = google.visualization.arrayToDataTable(lineChartArray);
                        let lineOptions = {
                            title: "Corona Virus Summary",
                            curveType: 'function',
                            legend: {position: 'bottom'}
                        }
                        let lineChart = new google.visualization.LineChart(document.getElementById("curve-chart"));
        
                        lineChart.draw(lineData, lineOptions);
                    });
                }
                
                renderModal();
    
                //===============  POTENTIAL ADD ON FUNCTIONALITY  ========================//
    
                //this will rerender map zoomed into the region clicked and show provinces/states
                // options = {
                    //     displayMode:'regions',
                    //     region: e.region,
                    //     resolution: "provinces"
                    // }
                    // chart.draw(data, options);
           }
        }
    
        //===============  ADD SELECT HANDLER AND DRAW CHART ========================//
    
        google.visualization.events.addListener(chart, 'select', selectHandler);
        
        chart.draw(data, options);
    }
    
    //===============  CALLBACK TO START FETCHING COUNTRY DATA ONCE LOADED ========================//
    
    google.charts.setOnLoadCallback(getCountryData);
    
    
});


    
