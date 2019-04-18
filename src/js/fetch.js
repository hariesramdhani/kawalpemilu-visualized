fetch('https://kawal-c1.appspot.com/api/c/0?1555615843740/')
  .then(response => {
    return response.json()
  })
  .then(data => {
    // Work with JSON data here
    a = data;
  })
  .catch(err => {
    // Do something for an error here
  })