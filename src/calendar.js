// import customViewPlugin from './customView.js';

document.addEventListener('DOMContentLoaded', () => {
    let calendarEl = document.getElementById('calendar');
        
    let calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridMonth',
        showNonCurrentDates: false
    });
    
    calendar.render();

    const renderInputsOnCal = (date) => {
        console.log(date)
        const calInput = document.createElement("input");
        const id = date.getAttribute("data-date");
        calInput.setAttribute('id', `calendarInput${id}`);
        calInput.setAttribute('class', 'calendarInput');
        calInput.setAttribute('placeholder', 'Cases');
        date.appendChild(calInput);
    }
    
    const today = document.getElementsByClassName("fc-day-top fc-today")[0];
    renderInputsOnCal(today);
    const futureDates = document.querySelectorAll(".fc-day-top.fc-future");
    futureDates.forEach(date => {
        renderInputsOnCal(date);
    })

    if (editMode){
        
    }

});