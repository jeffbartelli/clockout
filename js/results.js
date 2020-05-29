
var retire = JSON.parse(localStorage.retireData);
var cycle = localStorage.cycle;
console.log(retire);


$('#results').append($(`<table class="spreadsheet" id="resultsTable"/>`));
var keys = ['years','income','invAccts','tradAccts','rothAccts','totals'];
keys.forEach((item) => {
  if (retire[item]) {
    $('.spreadsheet').append($('<tr/>', {'class': item}).append($('<td/>', {'colspan': 1+cycle}).text(item)));
    let subKeys = Object.keys(retire[item]);
    subKeys.forEach((subItem) => {
      $(`.${item}`).after($('<tr/>', {'class': subItem}).append($('<td/>', {'colspan': 1+cycle}).text(subItem)));
      let tubKeys = Object.keys(retire[item][subItem]);
      tubKeys.forEach((tubItem) => {
        $(`.${subItem}`).after($('<tr/>', {class: tubItem}).append($('<td/>').text(tubItem)));
        for (let i=0; i<cycle; i++) {
          $(`.${tubItem}`).append($('<td/>').text(Math.ceil(retire[item][subItem][tubItem][i])));
        }
      });
    });
  }
});

// for (let i=0; i<keys.length; i++) {
//   var subKeys = Object.keys(retire[keys[i]]);
//   $('.spreadsheet').append(`<tr/ class="${keys[i]}" value="${keys[i]}"`);
//   for (let j=0; j<subKeys.length; j++) {
//     console.log(subKeys[j].length);
//     console.log(subKeys[j]);
//     $(`.${keys[i]}`).append(`<td/ class="${subKeys[j]}" value="${subKeys[j]}"`);
//   }
// }




// console.log(keys);