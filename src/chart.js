document.addEventListener("DOMContentLoaded", () => {
    //===============  LOAD GOOGLE PACKAGES ========================//
    google.charts.load('current', {packages: ['geochart', 'corechart'], 'mapsApiKey': ""});

    //===============  VARIABLES ========================//

    const latestUrl = "http:localhost:3000/latest_data";
    const countriesUrl = "http://localhost:3000/countries";
    const userUrl = "http://localhost:3000/users";
    const favoriteUrl = "http://localhost:3000/favorites";
    const favBtn = document.getElementById("fav-btn");
    const userId = 1;
    
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

     //===============  FAVORITE COUNTRY FUNCTIONS ========================//

    const renderFavorite = (country) => {
        const div = document.getElementById("countries-tracked");
        const a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("id", country.id);
        a.innerHTML = country.name;
        div.appendChild(a);
    
        a.onclick = () => {
            
        }
    }


    const getFavoritesbyUser = (id) => {
        return fetch(`${userUrl}/${id}`)
            .then(res => res.json())
            .then(favorites => {
                favorites.forEach(fave => {
                    renderFavorite(fave.country);
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

        getFavoritesbyUser(userId)
    }


    const checkIfUserFollowsCountry = (userId, countryId) => {
        return fetch(`${userUrl}/${userId}`)
            .then(res => res.json())
            .then(favorites => {
                return favorites.filter(fave => fave.country.id === countryId);
            })
            .catch(err => console.log(err));
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
                console.log(favorite);
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
                let currentCountry = data.getValue(selectedCountry.row, 0);
                const modal = document.getElementById("modal-1")
                modal.checked = true;

                const countryData = data_array.find(country => country[0] === currentCountry);
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
    
        //===============  ADD SELECT HANDLER AND DRAW CHART ========================//
    
        google.visualization.events.addListener(chart, 'select', selectHandler);
        
        chart.draw(data, options);
    }
    
    //===============  CALLBACK TO START FETCHING COUNTRY DATA ONCE LOADED ========================//
    
    google.charts.setOnLoadCallback(getCountryData);
    
    //===============  EVENT LISTENERS  ========================//
    
    favBtn.onclick = () => {
        renderFavoriteDashboard();
    }
});


    
