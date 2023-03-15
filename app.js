
// define variables which are used in the code for the HTML elements
let currentData = {
    people: [],
    dates: [],
  };
 
// Load data from CSV files  
async function loadData() {
    let people = await readCsv('people.csv');
    let dates = await readCsv('dates.csv');
    displaySchedule(people, dates);
  }
  
  // Read CSV files and return data
  async function readCsv(url) {
    const response = await fetch(url);
    const data = await response.text();
    const rows = data.split('\n').slice(1);
    return rows.map(row => row.split(','));
  }
  
  
  function displaySchedule(people, dates) {
    currentData.people = people;
    currentData.dates = dates;
    let scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';
  
    let table = document.createElement('table');
    let header = document.createElement('tr');
    header.innerHTML = '<th>Name</th><th>Date</th>';
    table.appendChild(header);
  
    // Shuffle dates array
    dates = shuffle(dates);
  
    for (let i = 0; i < people.length; i++) {
      let row = document.createElement('tr');
      let dateIndex = (i + Math.floor(i / dates.length)) % dates.length;
      row.innerHTML = `<td>${people[i][0]}</td><td>${dates[dateIndex][0]}</td>`;
      table.appendChild(row);
    }
  
    scheduleDiv.appendChild(table);
  }
  
  function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  // Export data to CSV
  document.getElementById('exportCsv').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,Name,Date\n";
    const { people, dates } = currentData;
  
    for (let i = 0; i < people.length; i++) {
      let row = [people[i], dates[i % dates.length]].join(',');
      csvContent += row + "\n";
    }
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lab_meeting_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  
  // format date for ICS file
  function formatDate(date) {
    const pad = (num) => ('0' + num).slice(-2);
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      'Z'
    );
  }
  
  // Create ICS file content
  function createICSContent(people, dates) {
    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Lab Meeting Scheduler//EN\r\n";
  
    for (let i = 0; i < people.length; i++) {
      const eventDate = new Date(dates[i % dates.length]);
      const startDate = formatDate(eventDate);
      const endDate = formatDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));
      const uid = startDate + '-' + i + '@labmeetingscheduler';
  
      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += "UID:" + uid + "\r\n";
      icsContent += "DTSTAMP:" + formatDate(new Date()) + "\r\n";
      icsContent += "DTSTART:" + startDate + "\r\n";
      icsContent += "DTEND:" + endDate + "\r\n";
      icsContent += "SUMMARY:Lab Meeting with " + people[i] + "\r\n";
      icsContent += "END:VEVENT\r\n";
    }
  
    icsContent += "END:VCALENDAR";
    return icsContent;
  }
  
  
  // event listener for the export to ICS button
  document.getElementById('exportCalendar').addEventListener('click', () => {
    const icsContent = createICSContent(currentData.people, currentData.dates);
    const encodedUri = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lab_meeting_schedule.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  
  
  // Load data when page loads
  document.getElementById('loadData').addEventListener('click', loadData);
  