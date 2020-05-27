
var retire = JSON.parse(localStorage.retireData);
var cycle = 49;

$('#results').append($(`<table class="spreadsheet"/>`));
var keys = Object.keys(retire);

for (let i=0; i<keys.length; i++) {
  var subKeys = Object.keys(retire[keys[i]]);
  console.log(keys[i]);
  $('.spreadsheet').append(`<tr/ class="${keys[i]}" value="${keys[i]}"`);
  for (let j=0; j<subKeys[j].length; j++) {
    console.log(subKeys[j]);
    $(`.${keys[i]}`).append(`<td/ class="${subKeys[j]}" value="${subKeys[j]}"`);
  }
}




// console.log(keys);