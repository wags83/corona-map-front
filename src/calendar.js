document.addEventListener('DOMContentLoaded', () => {
    let calendarEl = document.getElementById('calendar');
        
    let calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridMonth'
    });
    
    calendar.render();
});