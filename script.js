document.addEventListener('DOMContentLoaded', () => {
  fetch('/data')
    .then(response => response.json())
    .then(data => updateTable(data))
    .catch(error => console.error('Error:', error));
});

document.getElementById('glucose-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const datetimeString = document.getElementById('datetime').value;
  const isoDatetime = new Date(datetimeString).toISOString(); // Converte para ISO 8601

  const glucoseLevel = document.getElementById('glucose-level').value;

  const entry = {
    datetime: isoDatetime,
    glucoseLevel: glucoseLevel
  };

  fetch('/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  })
  .then(response => response.json())
  .then(data => updateTable(data))
  .catch(error => console.error('Error:', error));
});

function updateTable(data) {
  const tableBody = document.querySelector('#glucose-table tbody');
  tableBody.innerHTML = ''; // Limpa a tabela

  data.forEach(dayEntry => {
    const date = new Date(dayEntry.date);
    const formattedDate = addDays(date); // Utiliza a função para adicionar um dia à data

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${formatEntry(dayEntry.beforeBreakfast)}</td>
      <td>${formatEntry(dayEntry.afterBreakfast)}</td>
      <td>${formatEntry(dayEntry.beforeLunch)}</td>
      <td>${formatEntry(dayEntry.afterLunch)}</td>
      <td>${formatEntry(dayEntry.afternoon)}</td>
      <td>${formatEntry(dayEntry.beforeDinner)}</td>
      <td>${formatEntry(dayEntry.afterDinner)}</td>
      <td>${formatEntry(dayEntry.beforeSupper)}</td>
      <td>${formatEntry(dayEntry.afterSupper)}</td>
    `;
    tableBody.appendChild(row);
  });
}

function formatEntry(entry) {
  if (!entry) return '';
  const time = new Date(entry.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${entry.glucoseLevel} (${time})`;
}

function addDays(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1); // Adiciona um dia
  return newDate.toLocaleDateString('en-GB'); // Retorna a data aumentada em um dia no formato desejado
}