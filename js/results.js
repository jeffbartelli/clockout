import { dollarFormat } from "./numberFormats.js";

document.addEventListener('DOMContentLoaded', function() {
var results = () => {
  var retire = JSON.parse(localStorage.retireData);
  var cycle = localStorage.cycle;
  console.log(JSON.parse(localStorage.formData));
  console.log(retire);
  // $('#results').append($(`<table class="spreadsheet" id="resultsTable"/>`));
  $('#results').append(`<div class="tableContainer"><table class="spreadsheet" id="resultsTable"></table></div>`);
  let keys = ['years','income','invAccts','tradAccts','rothAccts','totals'];
  let subKeys = ['time','ssi','genPension','fersPension','annuities','vaDisability','ssiDisability','otherDisability','retireSal','rents','otherBen','saveAcct','investAcct','tradEca','simple401','simpleIra','tradIra','rothEca','rothIra','subTotals'];
  let tubKeys = ['remaining','required','taxes','wages','endValue','withdrawal','rmd','growth','contribution','principal','beginValue','annual','age','year']
  // ['year','age','annual','beginValue','rmd','withdrawal','endValue','wages','taxes','required','remaining'];

  keys.forEach((item) => {
    if (retire[item]) {
      subKeys.forEach((subItem) => {
        if (retire[item][subItem]){
          $('.spreadsheet').append($('<tr/>', {'class': subItem}).append($('<td/>', {'colspan': Number(cycle)+1}).text(subItem.replace( /([A-Z])/g, " $1" ))));
          tubKeys.forEach((keyItem) => {
            if (retire[item][subItem][keyItem]) {
              $(`tr.${subItem}:first`).after((`<tr class="${subItem} ${keyItem}"><td align="left">${keyItem.replace( /([A-Z])/g, " $1" )}</td></tr>`));
              for (let i=0; i<cycle; i++) {
                $(`.${subItem}.${keyItem}`).append($('<td/>', {'align': 'right'}).text([subItem] == "time" ? Math.ceil(retire[item][subItem][keyItem][i]) :
                  dollarFormat.format(Math.ceil(retire[item][subItem][keyItem][i]))));
              }
            }
          });
        }
      });
    }
  });
}
results();
});