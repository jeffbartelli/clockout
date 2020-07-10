import { dollarFormat } from "./numberFormats.js";

document.addEventListener('DOMContentLoaded', function() {
var results = () => {
  var retire = JSON.parse(localStorage.retireData);
  var cycle = localStorage.cycle;
  var userRetAge = localStorage.retAge;
  console.log(JSON.parse(localStorage.formData));
  console.log(retire);

  if (retire.retAge === false) {
    $('#results').prepend(`<p><span class="intro">Oh No!</span> You are not saving enough to retire at all. </p>`);
  } else {
    switch (true) {
      case (retire.retAge < userRetAge): 
        $('#results').prepend(`<p><span class="intro">Lucky Duck!</span> You're on track to retire at <span class="reportAge">${retire.retAge}</span>, rather than your target age of <span class="reportAge">${userRetAge}</span>. </p>`);
        break;
      case (retire.retAge = userRetAge):
        $('#results').prepend(`<p><span class="intro">Right On!</span> You're on track to retire at <span class="reportAge">${retAge}</span>. </p>`);
        break;
      case (retire.retAge > userRetAge):
        $('#results').prepend(`<p><span class="intro">Uh-oh!</span> You aren't saving enough to retire by <span class="reportAge">${userRetAge}</span>. Based on the information you provided, your earliest retirement age is <span class="reportAge">${retire.retAge}</span>. </p>`);
        break; 
    }
  };
  if (retire.retAge === false || retire.retAge > userRetAge) {
    $('#results').append(`<p>A basic rule of thumb is to have 25 times your target salary in savings at the time of retirement. Based on the information you provided, you'll be behind your goal at <span class="reportAge">${userRetAge}</span>. </p>`);
  } else {
    $('#results').append(`<p>To meet your goal, you'll need to keep saving at the rates you identified in the questionare. If ClockOut predicts you'll be able to retire earlier than expected, it assumes you'll stop contributing at <strong>${retire.retAge}</strong>. However, if you planned on having a job in retirement, ClockOut assumes that employment will begin at your new retirement age. </p>`);
  }
  $('#results').append(`<strong>Disclaimer:</strong> ClockOut does not guarantee any of the results it provides. It's an experimental tool, and any information it provides is only for planning purposes. ClockOut does not collect your personal information.`);
  

  $('#results').append(`<div class="tableContainer"><table class="spreadsheet" id="resultsTable"></table></div>`);
  let keys = ['years','income','invAccts','tradAccts','rothAccts','totals'];
  let subKeys = ['time','ssi','genPension','fersPension','annuities','vaDisability','ssiDisability','otherDisability','retireSal','rents','otherBen','saveAcct','investAcct','tradEca','simple401','simpleIra','tradIra','rothEca','rothIra','subTotals'];
  let tubKeys = ['remaining','required','taxes','wages','endValue','withdrawal','rmd','growth','contribution','principal','beginValue','annual','age','year'];

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