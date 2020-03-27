document.addEventListener("DOMContentLoaded", () => {
    //===============  LOAD GOOGLE PACKAGES ========================//
    google.charts.load('current', {packages: ['geochart', 'corechart'], 'mapsApiKey': ""});

    //===============  VARIABLES ========================//

    const latestUrl = "http://localhost:3000/latest_data";
    const popUrl = "http://localhost:3000/latest_data_by_population";
    const countriesUrl = "http://localhost:3000/countries";
    const userUrl = "http://localhost:3000/users";
    const favoriteUrl = "http://localhost:3000/favorites";
    const modal = document.getElementById("modal-1");
    const modal_array = []; 
    const fave_array = [["Country", "Selected"]];
    const favBtn = document.getElementById("fav-btn");
    const favRadios = document.getElementById("favRadios");
    const popRadios = document.getElementById("popRadios");
    const alerts = document.getElementById("alerts");
    let userId = 1;
    let editMode = false;
    let popMode = false;
    let chart;

    
    //===============  GET COUNTRY FUNCTIONS ========================//
    
    const getLatestData = (url) => {
        fetch(url)
        .then(res => res.json())
        .then(countries => {
            const type = url === latestUrl ? "latest" : "pop";
            let map_array;
            if (type === 'latest'){
                map_array = [['Country', 'Number of Cases']];
            } else {
                map_array = [['Country', 'Number of Cases per 100k']]
            }
            
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
            drawRegionsMapCases(type, map_array);
        
        })
        .catch(err => console.log(err));
    }


    const getCountryByName = (name) => {
        return fetch(countriesUrl)
            .then(res => res.json())
            .then(countries => {
                const found = countries.find(country => country.name === name);
                return found;
            })
            .catch(err => console.log(err));
    }

    
    const getCountryByDaysData = (id) => {
        return fetch(`${countriesUrl}/${id}`)
            .then(res => res.json())
            .then(days => days)
            .catch(err => console.log(err));
    }

     //===============  FAVORITE COUNTRY FUNCTIONS ========================//

    const renderFavorite = (country) => {
        const div = document.getElementById("countries-tracked");
        const a = document.createElement("a");
        a.setAttribute("id", country.id);
        a.innerHTML = country.name;
        div.appendChild(a);
        const countryData = modal_array.find(thisCountry => thisCountry[0] === country.name);
    
        a.onclick = () => {
            modal.checked = true;
            renderModal(country.name, countryData);
        }
    }


    const collectUsersFaves = (country) => {
        const editArray = [country.name, 1];
        fave_array.push(editArray);
    }


    const getFavoritesbyUser = (id, fn) => {
        return fetch(`${userUrl}/${id}`)
            .then(res => res.json())
            .then(favorites => {
                favorites.forEach(fave => {
                    fn(fave.country);
                })
            })
            .catch(err => console.log(err));
    }


    const addFavorite = (countryId) => {
        const configObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                country_id: countryId
            })
        }

        return fetch(favoriteUrl, configObject)
            .then(res => res.json())
            .then(fave => {
                renderFavorite(fave.country)
                renderAlert('add', fave.country.name)
            })
            .catch(err => console.log(err));
    }


    const deleteFavorite = (faveId) => {
        const configObject = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
        return fetch(`http://localhost:3000/favorites/${faveId}`, configObject)
            .then(res => res.json())
            .then(fave => {
                const a = document.getElementById(fave.country_id);
                a.remove();
                renderAlert('delete', fave.country.name);
            })
            .catch(err => console.log(err));
    };
    

    const renderFavoriteDashboard = () => {
        const sidebar = document.getElementById("fav-sidebar");
        const countriesDiv = document.getElementById("countries-tracked");
        countriesDiv.innerHTML = ""
        sidebar.style.width = "250px";

        const closebtn = document.getElementById("closebtn");
        closebtn.onclick = () => {
            sidebar.style.width = "0";
        }

        getFavoritesbyUser(userId, renderFavorite);
    }


    const checkIfUserFollowsCountry = (userId, countryId) => {
        return fetch(`${userUrl}/${userId}`)
            .then(res => res.json())
            .then(favorites => {
                return favorites.filter(fave => fave.country.id === countryId);
            })
            .catch(err => console.log(err));
    }

    //==================  RENDER ALERT FUNCTION ===========================//

    const renderAlert = (type, country) => {
        alerts.innerHTML = "";
        const input = document.createElement("input");
        input.setAttribute("class", "alert-state");
        input.setAttribute('id', `${country}-${type}-1`);
        input.setAttribute("type", "checkbox");
        const divAlert = document.createElement("div");
        type === "add" ? divAlert.setAttribute("class", "alert alert-secondary dismissible") : divAlert.setAttribute("class", "alert alert-danger dismissible");
        const label = document.createElement("label");
        label.setAttribute("class", "btn-close");
        label.setAttribute("for", `${country}-${type}-1`);
        label.innerHTML = "X";
        divAlert.innerHTML = type === "add" ? `${country} was added to your dashboard!` : `${country} was deleted from your dashboard`;
        divAlert.appendChild(label);
        alerts.appendChild(input);
        alerts.appendChild(divAlert);
    }


    //==================  RENDER MODAL FUNCTION ===========================//


    const renderModal = (country, countryData) => {
        const h4 = document.querySelector("#region-modal-title");
        const cases = document.querySelector("#modal-cases");
        const deaths = document.querySelector("#modal-deaths");
        const recovered = document.querySelector("#modal-recovered");
        const button = document.querySelector("#follow-btn");
        h4.innerHTML = country;
        cases.innerHTML = countryData[1];
        deaths.innerHTML = countryData[2];
        recovered.innerHTML = countryData[3];
        const countryId = countryData[4];
        

        //add/delete country buttons to modal ansd favorites dashboard
        const renderTrackButton = () => {
            const buttonResults = Promise.resolve(checkIfUserFollowsCountry(userId, countryId));
            buttonResults.then(favorite => {
                if (favorite.length > 0){
                    button.innerHTML = "x Stop Tracking";
                    button.onclick = () => {
                        Promise.resolve(deleteFavorite(favorite[0].id))
                            .then(() => renderTrackButton());
                    }
                } else {
                    button.innerHTML = "+ Track Country";
                    button.onclick = () => {
                        Promise.resolve(addFavorite(countryId))
                            .then(() => renderTrackButton());
                    }
                }
            });
        };

        renderTrackButton();
        
        //insert/draw line chart renderings and data after resolving promise
        const days = Promise.resolve(getCountryByDaysData(countryId));
        days.then(days => {
            const lineChartArray = [['Day', 'Cases', 'Deaths', 'Recovered']];

            days.forEach(day => {
                const lineRow = [day.date.slice(1,5), day.cases, day.deaths, day.recovered];
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
    
    
    //===============  DRAW MAP FUNCTIONS ========================//
    
    
    const drawRegionsMapCases = (type, display_array) => {
        chart = new google.visualization.GeoChart(document.getElementById('map'));
        let data = google.visualization.arrayToDataTable(display_array);
        let options;
        if (type === "latest"){
            options = {
                colorAxis: {minValue: 0,  colors: ['#34e8eb', '#3d34eb']},
                legend: {textStyle: {fontName: "Patrick Hand SC", fontSize: 13}},
                tooltip: {textStyle: {fontName: "Patrick Hand SC"}}
            };
        } else {
            options = {
                colorAxis: {minValue: 0,  colors: ['#86f7a4', '#0f8a30']},
                legend: {textStyle: {fontName: "Patrick Hand SC", fontSize: 13}},
                tooltip: {textStyle: {fontName: "Patrick Hand SC"}}
            };
        }
    
        //what happens on click for each region
        const selectHandler = () => {
           let selectedCountry = chart.getSelection()[0];
    
           if (selectedCountry) {
                let currentCountry = data.getValue(selectedCountry.row, 0);
                modal.checked = true;

                const countryData = modal_array.find(country => country[0] === currentCountry);
                renderModal(currentCountry, countryData);
    
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
    
        
        //add select handler and draw chart
        google.visualization.events.addListener(chart, 'select', selectHandler);    
        chart.draw(data, options);
    }

    const drawEditingMap = () => {
        chart = new google.visualization.GeoChart(document.getElementById('map'));
        const favePromise = Promise.resolve(getFavoritesbyUser(userId, collectUsersFaves));
        favePromise.then(() => {

        
            let data = google.visualization.arrayToDataTable(fave_array);
            let options = {
                colorAxis: {minValue: 0,  colors: ['#fff', '#f54242']},
                legend: {textStyle: {fontName: "Patrick Hand SC", fontSize: 13}},
                tooltip: {textStyle: {fontName: "Patrick Hand SC"}}
            };
            chart.draw(data, options);
    
            //what happens on click for each region
            const selectHandler = (e) => {
                console.log("REGION: ", e.region);
                const countryName = getCountryName(e.region);
                const row = data.getFilteredRows([{column: 0, value: countryName}]);
                if (row.length > 0){
                    data.removeRow(row[0]);
                    const countryPromise = Promise.resolve(getCountryByName(countryName));
                    countryPromise.then(country => {
                        const getFavePromise = Promise.resolve(checkIfUserFollowsCountry(userId, country.id));
                        getFavePromise.then(fave => {
                            deleteFavorite(fave[0].id)
                        })
                    })
                } else {
                    data.addRow([countryName, 1]);
                    const countryPromise = Promise.resolve(getCountryByName(countryName));
                    countryPromise.then(country => {
                        addFavorite(country.id);
                    })
                }
                chart.draw(data, options);
             }
         
             
             //add select handler and draw chart
             google.visualization.events.addListener(chart, 'regionClick', selectHandler); 

        })
    }
    
    //===============  CALLBACK TO START FETCHING COUNTRY DATA ONCE LOADED ========================//
    
    google.charts.setOnLoadCallback(getLatestData(latestUrl));
    
    //===============  EVENT LISTENERS  ========================//
    
    favBtn.onclick = () => {
        renderFavoriteDashboard();
    }

    favRadios.onclick = () => {
        if (editMode) {
            favRadios.checked = false;
            editMode = false;
            getLatestData(latestUrl);
        } else {
            favRadios.checked = true;
            editMode = true;
            // chart.clearChart();
            drawEditingMap();
        }
    }

    popRadios.onclick = () => {
        if (popMode){
            popRadios.checked = false;
            popMode = false;
            getLatestData(latestUrl);
        } else {
            popRadios.checked = true;
            popMode = true;
            getLatestData(popUrl);
        }
    }
});


    
