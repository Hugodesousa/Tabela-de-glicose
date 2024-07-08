const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

const csvFilePath = 'glucose_data.csv';
const timezone = 'America/Sao_Paulo'; // Ajuste para seu fuso horário

// Helper function to read CSV and parse data
function readCSV() {
  if (!fs.existsSync(csvFilePath)) {
    return [];
  }
  const data = fs.readFileSync(csvFilePath, 'utf8');
  return data.split('\n').filter(line => line).map(line => {
    const [datetime, glucoseLevel] = line.split(',');
    return { datetime, glucoseLevel: parseFloat(glucoseLevel) };
  });
}

// Helper function to write data to CSV
function writeCSV(entries) {
  const csvData = entries.map(entry => `${entry.datetime},${entry.glucoseLevel}`).join('\n');
  fs.writeFileSync(csvFilePath, csvData, 'utf8');
}

// Helper function to group data by date and fill missing dates
// function groupDataByDate(entries) {
//   const grouped = {};
//   entries.forEach(entry => {
//     const date = moment.tz(entry.datetime, timezone).format('YYYY-MM-DD');
//     const time = moment.tz(entry.datetime, timezone).hours();
    
//     if (!grouped[date]) {
//       grouped[date] = {
//         date,
//         beforeBreakfast: null,
//         afterBreakfast: null,
//         beforeLunch: null,
//         afterLunch: null,
//         afternoon: null,
//         beforeDinner: null,
//         afterDinner: null,
//         beforeSupper: null,
//         afterSupper: null
//       };
//     }
    
//     if (time < 9) {
//       grouped[date].beforeBreakfast = entry.glucoseLevel;
//     } else if (time < 11) {
//       grouped[date].afterBreakfast = entry.glucoseLevel;
//     } else if (time < 13) {
//       grouped[date].beforeLunch = entry.glucoseLevel;
//     } else if (time < 15) {
//       grouped[date].afterLunch = entry.glucoseLevel;
//     } else if (time < 18) {
//       grouped[date].afternoon = entry.glucoseLevel;
//     } else if (time < 19.5) {
//       grouped[date].beforeDinner = entry.glucoseLevel;
//     } else if (time < 21) {
//       grouped[date].afterDinner = entry.glucoseLevel;
//     } else if (time < 22.5) {
//       grouped[date].beforeSupper = entry.glucoseLevel;
//     } else {
//       grouped[date].afterSupper = entry.glucoseLevel;
//     }
//   });

//   const sortedDates = Object.keys(grouped).sort();
//   const completeData = [];

//   if (sortedDates.length > 0) {
//     let currentDate = moment.tz(sortedDates[0], timezone);

//     while (currentDate.isSameOrBefore(sortedDates[sortedDates.length - 1])) {
//       const dateStr = currentDate.format('YYYY-MM-DD');
//       if (!grouped[dateStr]) {
//         grouped[dateStr] = {
//           date: dateStr,
//           beforeBreakfast: null,
//           afterBreakfast: null,
//           beforeLunch: null,
//           afterLunch: null,
//           afternoon: null,
//           beforeDinner: null,
//           afterDinner: null,
//           beforeSupper: null,
//           afterSupper: null
//         };
//       }
//       completeData.push(grouped[dateStr]);
//       currentDate.add(1, 'days');
//     }
//   }

//   return completeData;
// }

function groupDataByDate(entries) {
  const grouped = {};
  entries.forEach(entry => {
    const date = moment.tz(entry.datetime, timezone).format('YYYY-MM-DD');
    const time = moment.tz(entry.datetime, timezone).hours();
    const datetime = moment.tz(entry.datetime, timezone).format('YYYY-MM-DD HH:mm');

    if (!grouped[date]) {
      grouped[date] = {
        date,
        beforeBreakfast: null,
        afterBreakfast: null,
        beforeLunch: null,
        afterLunch: null,
        afternoon: null,
        beforeDinner: null,
        afterDinner: null,
        beforeSupper: null,
        afterSupper: null
      };
    }

    const glucoseEntry = { datetime, glucoseLevel: entry.glucoseLevel };

    if (time < 9) {
      grouped[date].beforeBreakfast = glucoseEntry;
    } else if (time < 11) {
      grouped[date].afterBreakfast = glucoseEntry;
    } else if (time < 13) {
      grouped[date].beforeLunch = glucoseEntry;
    } else if (time < 15) {
      grouped[date].afterLunch = glucoseEntry;
    } else if (time < 18) {
      grouped[date].afternoon = glucoseEntry;
    } else if (time < 19.5) {
      grouped[date].beforeDinner = glucoseEntry;
    } else if (time < 21) {
      grouped[date].afterDinner = glucoseEntry;
    } else if (time < 22.5) {
      grouped[date].beforeSupper = glucoseEntry;
    } else {
      grouped[date].afterSupper = glucoseEntry;
    }
  });

  const sortedDates = Object.keys(grouped).sort();
  const completeData = [];

  if (sortedDates.length > 0) {
    let currentDate = moment.tz(sortedDates[0], timezone);

    while (currentDate.isSameOrBefore(sortedDates[sortedDates.length - 1])) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          beforeBreakfast: null,
          afterBreakfast: null,
          beforeLunch: null,
          afterLunch: null,
          afternoon: null,
          beforeDinner: null,
          afterDinner: null,
          beforeSupper: null,
          afterSupper: null
        };
      }
      completeData.push(grouped[dateStr]);
      currentDate.add(1, 'days');
    }
  }

  return completeData;
}


app.post('/add', (req, res) => {
  const { datetime, glucoseLevel } = req.body;
  const entries = readCSV();
  entries.push({ datetime, glucoseLevel: parseFloat(glucoseLevel) });
  writeCSV(entries);

  const groupedData = groupDataByDate(entries);
  res.json(groupedData);
});

app.get('/data', (req, res) => {
  const entries = readCSV();
  const groupedData = groupDataByDate(entries);
  console.log('/data-->', groupedData);
  res.json(groupedData);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
