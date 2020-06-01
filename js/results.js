
var retire = JSON.parse(localStorage.retireData);
var cycle = localStorage.cycle;
console.log(retire);


// $('#results').append($(`<table class="spreadsheet" id="resultsTable"/>`));
$('#results').append(`<div class="tableContainer"><table class="spreadsheet" id="resultsTable"></table></div>`);
let keys = ['years','income','invAccts','tradAccts','rothAccts','totals'];
let subKeys = ['time','ssi','genPension','fersPension','annuities','vaDisability','ssiDisability','otherDisability','retireSal','rents','otherBen','investAcct','tradEca','simple401','simpleIra','tradIra','rothEca','rothIra','subTotals'];
let tubKeys = ['remaining','required','taxes','wages','endValue','withdrawal','rmd','contributions','beginValue','annual','age','year']
// ['year','age','annual','beginValue','rmd','withdrawal','endValue','wages','taxes','required','remaining'];

keys.forEach((item) => {
  if (retire[item]) {
    subKeys.forEach((subItem) => {
      if (retire[item][subItem]){
        $('.spreadsheet').append($('<tr/>', {'class': subItem}).append($('<td/>', {'colspan': Number(cycle)+1}).text(subItem)));
        tubKeys.forEach((keyItem) => {
          if (retire[item][subItem][keyItem]) {
            $(`tr.${subItem}:first`).after((`<tr class="${subItem} ${keyItem}"><td>${keyItem}</td></tr>`));
            for (let i=0; i<cycle; i++) {
              $(`.${subItem}.${keyItem}`).append($('<td/>').text(Math.ceil(retire[item][subItem][keyItem][i])));
            }
          }
        });
      }
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