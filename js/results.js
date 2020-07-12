import { dollarFormat } from "./numberFormats.js";

document.addEventListener('DOMContentLoaded', function() {
var results = () => {
  var retire = JSON.parse(localStorage.retireData);
  var cycle = localStorage.cycle;
  var userRetAge = localStorage.retAge;
  var age = parseInt(localStorage.age);
  var ssiAge = localStorage.ssiAge;
  var expenses = localStorage.getItem("expenses") === null ? null : JSON.parse(localStorage.expenses);
  var demographics = JSON.parse(localStorage.formData);
  console.log(JSON.parse(localStorage.formData));
  console.log(retire);

  if (retire.retAge == false) {
    $('#results').prepend(`<p><span class="intro">Oh No!</span> You are not saving enough to retire at all. </p>`);
  } else {
    switch (true) {
      case (retire.retAge === age):
        $('#results').prepend(`<p><span class="intro">Submit Your Two Week Notice!</span> You've already saved enough money to never work again based on your target retirement salary. </p>`); 
        break;
      case (retire.retAge < userRetAge): 
        $('#results').prepend(`<p><span class="intro">Lucky Duck!</span> You're on track to retire at <span class="reportAge">${retire.retAge}</span> in <span class="reportAge">${new Date().getFullYear() + (retire.retAge - age)}</span>, rather than your target age of <span class="reportAge">${userRetAge}</span> in <span class="reportAge">${new Date().getFullYear() + (userRetAge - age)}</span>. </p>`);
        break;
      case (retire.retAge === userRetAge):
        $('#results').prepend(`<p><span class="intro">Right On!</span> You're on track to retire at the age of <span class="reportAge">${retire.retAge}</span> in <span class="reportAge">${new Date().getFullYear() + (retire.retAge - age)}</span>. </p>`);
        break;
      case (retire.retAge > userRetAge):
        $('#results').prepend(`<p><span class="intro">Almost There!</span> You aren't saving enough to retire by <span class="reportAge">${userRetAge}</span>. Based on the information you provided, your earliest retirement age is <span class="reportAge">${retire.retAge}</span> in <span class="reportAge">${new Date().getFullYear() + (retire.retAge - age)}</span>. </p>`);
        break; 
    }
  };
  if (retire.retAge === false || retire.retAge > userRetAge) {
    $('#results').append(`<p>A basic rule of thumb is to have 25 times your target salary in savings at the time of retirement. Based on the information you provided, you'll be behind your goal at <span class="reportAge">${userRetAge}</span>. </p>`);
  } else {
    $('#results').append(`<p>To meet your goal, you'll need to keep saving at the rates you identified in the questionare. If ClockOut predicts you'll be able to retire earlier than expected, it assumes you'll stop contributing to all of your accounts at <span class="reportAge">${retire.retAge}</span>. However, if you planned on having a job in retirement, ClockOut assumes that employment will begin at your new retirement age. </p>`);
  }
  if (!retire.retAge) {
    $('#results').append(`<p>Your target annual salary is <span class="reportDollar">${dollarFormat.format(demographics.demographics.retSal)}</span> in today's dollars. By going back and reducing your projected retirement expenses, you may be able to determine at what age you can retire.</p>`);
  } else {
    $('#results').append(`<h3>Retirement Expenses</h3><p>Your target annual salary is <span class="reportDollar">${dollarFormat.format(demographics.demographics.retSal)}</span> in today's dollars. After accounting for inflation, the equivalent salary when you retire will be <span class="reportDollar">${dollarFormat.format(retire.totals.subTotals.wages[retire.retAge - age])}</span> net, or <span class="reportDollar">${dollarFormat.format(retire.totals.subTotals.required[retire.retAge - age])}</span> gross.</p><p><strong>Note:</strong> ClockOut estimates total tax burden to be 20% of what you'll need. Future updates to ClockOut will provide a more accurate estimate of tax burden based on account type.</p>`);
    if (expenses) {
      let multiplier = retire.totals.subTotals.wages[retire.retAge - age] / demographics.demographics.retSal;
      $('#results').append(`
        <div id="expenseTable">
          <table id="retirementExpenses">
            <tr>
              <th colspan="3">Retirement Expenses</th>
            </tr>
            <tr>
              <th>Expense</th>
              <th>${new Date().getFullYear()}</th>
              <th>${new Date().getFullYear() + (retire.retAge - age)}</th>
            </tr>
            <tr>
              <td>Housing</td>
              <td class="tdRight">${dollarFormat.format(expenses.housing)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.housing * multiplier))}</td>
            </tr>
            <tr>
              <td>Transportation</td>
              <td class="tdRight">${dollarFormat.format(expenses.transport)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.transport * multiplier))}</td>
            </tr>
            <tr>
              <td>Groceries</td>
              <td class="tdRight">${dollarFormat.format(expenses.groceries)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.groceries * multiplier))}</td>
            </tr>
            <tr>
              <td>Health</td>
              <td class="tdRight">${dollarFormat.format(expenses.health)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.health * multiplier))}</td>
            </tr>
            <tr>
              <td>Travel</td>
              <td class="tdRight">${dollarFormat.format(expenses.travel)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.travel * multiplier))}</td>
            </tr>
            <tr>
              <td>Other</td>
              <td class="tdRight">${dollarFormat.format(expenses.other)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.other * multiplier))}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td class="tdRight">${dollarFormat.format(expenses.retSalTotal)}</td>
              <td class="tdRight">${dollarFormat.format(Math.round(expenses.retSalTotal * multiplier))}</td>
            </tr>
          </table>
        </div>
        <p>Your anticipated financial needs in retirement are presented in the table on the right, along with a look at equivalent amounts for when you begin retirement. The increase is based on an average inflation rate of 3.22%: actual inflation rates can be higher or lower on a year by year basis.</p>
      `);
    }
  }
  $('#results').append(`<h3>Financial Drawdown</h3><p>ClockOut has determined how best for you to withdraw your money in retirement to make it last as long as possible while complying with the laws of the United States. The graph below shows all of your accounts and when you will be withdrawing from them.</p>`);
  $('#results').append(`<div class="drawdownTable"><table id="drawdownTable" cellspacing="0" cellpadding="0" style="margin: 0px;"></table></div>`);
  $('#results').append(`<p>Your retirement income and investments include:</p>`);

  if (retire.income.socialSecurity) {
    $('#results').append(`<p><h4>Social Security</h4> Though you had planned to begin Social Security at the age of ${demographics.socialSecurity.beginAge_ssi}, you would be better served filing for benefits beginning at the age of <span class="reportAge">${ssiAge}</span>. This will maximize your chances of ensuring you have enough funds annually to meet your retirement needs.</p>
    <p>You will need to file with the <a href="https://www.ssa.gov/benefits/forms/" target="_blank">Social Security Administration</a> to begin receiving benefits. Remember: you cannot receive benefits before the age of 62.</p>`);
  }
  if (retire.income.genPension) {
    $('#results').append(`<p><h4>Pensions</h4></p>`);
  }
  if (retire.income.fersPension) {
    $('#results').append(`<p><h4>FERS Pension</h4></p>`);
  }
  if (retire.income.annuities) {
    $('#results').append(`<p><h4>Annuities & Insurance</h4></p>`);
  }
  if (retire.income.vaDisability) {
    $('#results').append(`<p><h4>VA Disability</h4></p>`);
  }
  if (retire.income.ssiDisability) {
    $('#results').append(`<p><h4>SSI Disability</h4></p>`);
  }
  if (retire.income.otherDisability) {
    $('#results').append(`<p><h4>Other Disability</h4></p>`);
  }
  if (retire.income.retireSal) {
    $('#results').append(`<p><h4>Retirement Salary</h4>You indicated that you will continue to work after retirement...</p>`);
  }
  if (retire.income.rents) {
    $('#results').append(`<p><h4>Rental Income</h4></p>`);
  }
  if (retire.income.otherBen) {
    $('#results').append(`<p><h4>Other Sources of Benefits</h4></p>`);
  }
  if (retire.income.saveAcct) {
    $('#results').append(`<p><h4>Savings & Money Market Accounts</h4></p>`);
  }
  if (retire.income.investmentAcct) {
    $('#results').append(`<p><h4>Investment/Brokerage Accounts</h4></p>`);
  }
  if (retire.income.tradEca) {
    $('#results').append(`<p><h4>Traditional Employee Contribution Accounts</h4></p>`);
  }
  if (retire.income.simple401) {
    $('#results').append(`<p><h4>Simple 401k</h4></p>`);
  }
  if (retire.income.simpleIra) {
    $('#results').append(`<p><h4>Simple IRA</h4></p>`);
  }
  if (retire.income.tradIra) {
    $('#results').append(`<p><h4>Traditional IRA</h4></p>`);
  }
  if (retire.income.rothEca) {
    $('#results').append(`<p><h4>Roth Employee Contribution Accounts</h4></p>`);
  }
  if (retire.income.rothIra) {
    $('#results').append(`<p><h4>Roth IRA</h4></p>`);
  }

  $('#results').append(`<p><h3>Assumptions & Methodology</h3></p>`);

  $('#results').append(`<p><strong>Disclaimer:</strong> ClockOut does not guarantee any of the results it provides. It's an experimental tool, and any information it provides is only for planning purposes. ClockOut does not collect your personal information.</p>`);

  // $('#results').append(`<div class="tableContainer"><table class="spreadsheet" id="resultsTable"></table></div>`);
  let keys = ['years','income','invAccts','tradAccts','rothAccts','totals'];
  let subKeys = ['time','socialSecurity','genPension','fersPension','annuities','vaDisability','ssiDisability','otherDisability','retireSal','rents','otherBen','saveAcct','investmentAcct','tradEca','simple401','simpleIra','tradIra','rothEca','rothIra','subTotals'];
  let tubKeys = ['remaining','required','taxes','wages','endValue','withdrawal','rmd','principal','beginValue','annual','age','year'];
  let drawdownTubKeys = ['year','withdrawal','annual'];
  let colors = ["#85e2d0","#e7bfca","#cddd97","#cac1e3","#c6daa5","#7ab4f9","#b2d6c1","#f7ad94","#a7dde2","#dbcd9f","#85bef3","#dbc6ab","#6cdcfa","#f1a3ba","#b7e1a7","#e9bbe7","#eed69b","#ecaadd","#96ddae","#c0a4eb","#cdb77e","#92c7ed","#d9b3ee","#b8b1f3","#cbbaef"];

  keys.forEach((item) => {
    if (retire[item]) {
      subKeys.forEach((subItem) => {
        if (retire[item][subItem]){
          $('#resultsTable').append($('<tr/>', {'class': subItem}).append($('<td/>', {'colspan': Number(cycle)+1}).text(subItem.replace( /([A-Z])/g, " $1" ))));
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

  let breaker = 0;
  keys.forEach((item) => {
    if (retire[item]) {
      subKeys.forEach((subItem, ind, arr) => {
        if (retire[item][subItem]){
          drawdownTubKeys.forEach((tubItem) => {
            if (retire[item][subItem][tubItem]) {
              if (subItem == "time") {
                $('#drawdownTable').append($(`<tr class="${subItem} ${tubItem}"/>`).append($('<td/>').css({"background-color": "lightBlue","padding-left": "5px","white-space":"nowrap"}).text(tubItem.replace( /([A-Z])/g, " $1" ).toUpperCase())));
              } else {
                $('#drawdownTable').append($(`<tr class="${subItem} ${tubItem}"/>`).append($('<td/">').css({"background-color": "lightCyan","white-space":"nowrap","padding-left": "5px"}).text(subItem.replace( /([A-Z])/g, " $1" ).toUpperCase())));
              };
              if (breaker < 1) {
                for (let i=0; i<cycle; i++) {
                  $(`table#drawdownTable .time.year`)
                    .append($('<td/>')
                    .css({"background-color": "lightBlue", "font-weight": "bold"})
                    .text(i % 5 === 0 ? `${retire.years.time.year[i]}` : ``)
                    );
                }
                breaker += 1;
              }  
              for (let i=0; i<cycle; i++) {
                  $(`table#drawdownTable .${subItem}.${tubItem}`)
                  .not(`.time.year`)
                  .append($('<td style="width:10px"/>')
                  .css("background-color", function() {
                      if (retire[item][subItem].rmd) {
                        if (retire[item][subItem].withdrawal[i] || retire[item][subItem].rmd[i] !== 0) {
                          return colors[subKeys.indexOf(arr[ind])];
                        } else {
                          return "white";
                        }
                      } else {
                        if (retire[item][subItem][tubItem][i] !== 0) {
                          return colors[subKeys.indexOf(arr[ind])];
                        } else {
                          return "white";
                        }
                      }
                  }));
                  // retire[item][subItem][tubItem][i] === 0 ? {"background-color": "white"} :
                  // {"background-color": colors[subKeys.indexOf(arr[ind])]}));
              // }
              };
            };
          });
        };
      });
    };
  });
}
results();
});