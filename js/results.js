import { dollarFormat, percentFormat } from "./numberFormats.js";
import { growthRate } from './data.js';

window.goBack = () => {
  window.history.back();
}

window.clearValues = () => {
  if (confirm("This will delete all the data you have entered. Are you sure you want to proceed?") == true) {
    localStorage.clear();
    window.history.back();
  }
}

window.printReport = () => {
  $("#results").show();
  $("#tableView").show();
  window.print();
  $("#tableView").hide();
}

window.reportToggle = () => {
  $("#results").toggle();
  $("#tableView").toggle();
  if ($("#tableView").is(':visible')) {
    document.getElementById('reportToggle').innerHTML = 'Report View';
  } else {
    document.getElementById('reportToggle').innerHTML = 'Table View';
  }
}

window.sendEmail = () => {
  window.open(`mailto:jeff.bartelli@zoho.com?subject=I'm Having Troubles with ClockOut&body=Here's a description of the problems I'm having...`);
}

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
        $('#results').prepend(`<p><span class="intro">Submit Your Two Week Notice!</span> You've already saved enough money to never work again based on your target retirement income. </p>`); 
        break;
      case (retire.retAge < userRetAge): 
        $('#results').prepend(`<p><span class="intro">Lucky Duck!</span> You're on track to retire at <span class="reportAge">${retire.retAge}</span> in <span class="reportAge">${new Date().getFullYear() + (retire.retAge - age)}</span>, rather than your target age of <span class="reportAge">${userRetAge}</span> in <span class="reportAge">${new Date().getFullYear() + (userRetAge - age)}</span>. </p>`);
        break;
      case (retire.retAge == userRetAge):
        $('#results').prepend(`<p><span class="intro">Right On!</span> You're on track to retire at the age of <span class="reportAge">${retire.retAge}</span> in <span class="reportAge">${new Date().getFullYear() + (retire.retAge - age)}</span>. </p>`);
        break;
      case (retire.retAge > userRetAge):
        $('#results').prepend(`<p><span class="intro">Almost There!</span> You aren't saving quite enough to retire by <span class="reportAge">${userRetAge}</span>, but you are saving enough to retire as early as the age of <span class="reportAge">${retire.retAge}</span> in <span class="reportAge">${new Date().getFullYear() + (retire.retAge - age)}</span>. </p>`);
        break; 
    }
  };
  if (retire.retAge === false || retire.retAge > userRetAge) {
    $('#results').append(`<p>A basic rule of thumb is to have 25 times your target income in savings at the time of retirement. Based on the information you provided, you'll be behind your goal at <span class="reportAge">${userRetAge}</span>. </p>`);
  } else {
    $('#results').append(`<p>To meet your goal, you'll need to keep saving at the rates you identified in the questionare. If ClockOut predicts you'll be able to retire earlier than expected, it assumes you'll stop contributing to all of your accounts at <span class="reportAge">${retire.retAge}</span>. However, if you planned on having a job in retirement, ClockOut assumes that employment will begin at your new retirement age. </p>`);
  }
  if (!retire.retAge) {
    $('#results').append(`<p>Your target annual income is <span class="reportDollar">${dollarFormat.format(demographics.demographics.retSal)}</span> in today's dollars. By going back and reducing your projected retirement expenses, you may be able to determine at what age you can retire.</p>`);
  } else {
    $('#results').append(`<h3>Retirement Expenses</h3><p>Your target annual income is <span class="reportDollar">${dollarFormat.format(demographics.demographics.retSal)}</span> in today's dollars. After accounting for inflation, the equivalent income when you retire will be <span class="reportDollar">${dollarFormat.format(Math.round(retire.totals.subTotals.wages[retire.retAge - age]))}</span> net, or <span class="reportDollar">${dollarFormat.format(Math.round(retire.totals.subTotals.required[retire.retAge - age]))}</span> gross.</p><p><strong>Note:</strong> ClockOut estimates total tax burden to be 20% of your estimated retirement expenses. Future updates to ClockOut will provide a more accurate estimate of tax burden based on account type.</p>`);
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
        <p>Your anticipated financial needs in retirement are presented in the table on the right, along with a look at equivalent amounts for when you begin retirement. The increase is based on an average U.S. inflation rate of 3.22%: actual inflation rates can be higher or lower on a year by year basis.</p>
      `);
    }
  }
  $('#results').append(`<h3>Financial Drawdown</h3><p>ClockOut has determined how best for you to withdraw your money in retirement to make it last as long as possible while complying with the laws of the United States. The graph below shows all of your accounts and when you will be withdrawing from them.</p>`);
  $('#results').append(`<div class="drawdownTable"><table id="drawdownTable" cellspacing="0" cellpadding="0" style="margin: 0px;"></table></div>`);
  $('#results').append(`<span class="tableView"><p>Click the 'Table View' button at the top to review the year by year details your account values and retirement withdrawals.<p></span>`);
  $('#results').append(`<h3>Your retirement income and investments include:</h3>`);
  function ssiPercent () {
    switch (parseInt(ssiAge)) { 
      case 62: return 70;
      case 63: return 76;
      case 64: return 82;
      case 65: return 88;
      case 66: return 94;
      case 67: return 100;
      case 68: return 108;
      case 69: return 116;
      case 70: return 124;
    };
  }
  if (retire.income) {
    if (retire.income.socialSecurity) {
      $('#results').append(`<p><h4>Social Security</h4> ${(ssiAge == demographics.socialSecurity.beginAge_ssi) ? 'The best age for you to begin receiving Social Security benefits is <span class="reportAge">' + ssiAge + "</span>. " : "Though you had planned to begin Social Security at the age of " + demographics.socialSecurity.beginAge_ssi + ', you would be better served filing for benefits beginning at the age of <span class="reportAge">' + ssiAge + "</span>."} Beginning your Social Security benefits at this age will entitle you to payments that equal ${ssiPercent()}% of your benefit. This will maximize your chances of ensuring you have enough funds annually to meet your retirement needs.</p>
      <p>You will need to file with the <a href="https://www.ssa.gov/benefits/forms/" target="_blank">Social Security Administration</a> to begin receiving benefits. <strong>Remember:</strong> you cannot receive this benefit before the age of 62.</p>`);
    }
    if (retire.income.genPension) {
      $('#results').append(`<p><h4>Pensions</h4> The data you entered indicates that your pension will have an annual ${demographics.genPension.tax_genPension === "on" ? "taxable": ""} payout of <span class="reportDollar">${dollarFormat.format(demographics.genPension.annAmt_genPension)}</span>, beginning at age <span class="reportAge">${demographics.genPension.beginAge_genPension}</span> in ${new Date().getFullYear() + (demographics.genPension.beginAge_genPension - age)}. The pension will grow at an average rate of ${percentFormat.format(demographics.genPension.colaRate_genPension/100)}, which will begin to be applied in ${new Date().getFullYear() + (demographics.genPension.colaAge_genPension - age)}.</p>`);
    }
    if (retire.income.fersPension) {
      $('#results').append(`<p><h4>FERS Pension</h4> The data you entered indicates that your FERS pension will have an annual taxable payout of <span class="reportDollar">${dollarFormat.format(demographics.fersPension.annAmt_fersPension)}</span>, beginning at age <span class="reportAge">${demographics.fersPension.beginAge_fersPension}</span> in ${new Date().getFullYear() + (demographics.fersPension.beginAge_fersPension - age)}. After that date, the benefit will receive an annual inflation increase of approximately <strong>1.8%</strong>. </p><p>You will need to apply with the <a href="https://www.opm.gov/retirement-services/csrs-information/planning-and-applying/#url=Apply" target="_blank">Office of Personnel Management</a> to begin receiving benefits. <strong>Remember:</strong> you cannot receive this benefit before the age of 57.</p>`);
    }
    if (retire.income.annuities) {
      $('#results').append(`<p><h4>Annuities & Insurance</h4> The data that you entered indicates that your annuity will have an annual ${demographics.annuities.tax_annuities === "on" ? "taxable": ""} payout of <span class="reportDollar">${dollarFormat.format(demographics.annuities.annAmt_annuities)}</span>, beginning at age <span class="reportAge">${demographics.annuities.beginAge_annuities}</span> in <strong>${new Date().getFullYear() + (demographics.annuities.beginAge_annuities - age)}</strong>. After that date, the benefit will receive an annual inflation increase of approximately <strong>${percentFormat.format(demographics.annuities.colaRate_annuities/100)}</strong>.</p>`);
    }
    if (retire.income.vaDisability) {
      $('#results').append(`<p><h4>VA Disability</h4>Your VA Disability is a non-taxable benefit. The data you entered indicates that it is currently worth <span class="reportDollar">${dollarFormat.format(demographics.vaDisability.annAmt_vaDisability)}</span> per year. ${retire.retAge === false ? "": 'Your annual benefit will grow at approximately <strong>2.3%</strong> annually, to reach an annual value of <span class="reportDollar">' + dollarFormat.format(Math.round(retire.income.vaDisability.annual[retire.income.vaDisability.annual.findIndex(n => n > 0)])) + '</span> when you begin retirement.'}</p>`);
    }
    if (retire.income.ssiDisability) {
      $('#results').append(`<p><h4>Social Security Disability Insurance</h4> Based on your responses, you currently receive SSDI benefits in the annual amount of <span class="reportDollar">${dollarFormat.format(demographics.ssiDisability.annAmt_ssiDisability)}</span>. The SSDI (and SSI) benefits usually aren't taxed. It will receive an annual inflation adjustment of approximately <strong>${percentFormat.format(growthRate.ssi)}</strong>.</p>`);
    }
    if (retire.income.otherDisability) {
      $('#results').append(`<p><h4>Other Disability</h4> The data that you provided indicates you currently receive <span class="reportDollar">${dollarFormat.format(demographics.otherDisability.annAmt_otherDisability)}</span> per year of ${demographics.otherDisability.tax_otherDisability === "on" ? "taxable": ""} disability benefits. It will receive an annual inflation adjustment of approximately <strong>${percentFormat.format(demographics.otherDisability.colaRate_otherDisability/100)}</strong></p>`);
    }
    if (retire.income.retireSal) {
      $('#results').append(`<p><h4>Retirement Salary</h4>It looks like you intend to keep working after your big retirement. Good for you. Based on your responses, you plan to begin your post-retirement employment at the age of <span class="reportAge">${demographics.retireSal.beginAge_retireSal}</span> in <strong>${new Date().getFullYear() + (demographics.retireSal.beginAge_retireSal - age)}</strong>. ${(retire.retAge == false) ? "Unfortunately you aren't on track to have enough resources to retire at all, so your planned post-retirement employment will not happen." : (retire.retAge > demographics.retireSal.beginAge_retireSal) ? "Your target age for beginning post-retirement employment was earlier than your retirement age, so Clockout has adjusted your target post-retirement age to " + ((data.retireSal.beginAge_retireSal < ages.retire && ages.retire <= data.retireSal.endAge_retireSal) ? ages.retire : (ages.retire > data.retireSal.endAge_retireSal) ? data.retireSal.endAge_retireSal : data.retireSal.beginAge_retireSal) + ". You will end post-retirement employment at the age of " + data.retireSal.endAge_retireSal + " in " + new Date().getFullYear() + (demographics.retireSal.endAge_retireSal - age) + ". " : ""} `);
    }
    if (retire.income.rents) {
      $('#results').append(`<p><h4>Rental Income</h4>You expect to generate income from rental properties in retirement. Specifically, you expect to earn <span class="reportDollar">${dollarFormat.format(demographics.rents.annAmt_rents)}</span> growing at an annual rate of <strong>${percentFormat.format(demographics.rents.colaRate_rents/100)}</strong>, which will have a value of <span class="reportDollar">${dollarFormat.format(Math.round(retire.income.rents.annual[retire.income.rents.annual.findIndex(n => n > 0)]))}</span> in the year of your retirement.</p>`);
    }
    if (retire.income.otherBen) {
      $('#results').append(`<p><h4>Other Sources of Benefits</h4>This includes all other benefits that apply to your retirement. Based on your responses, these ${demographics.otherBen.otherBenTax === "on" ? "taxable": ""} benefits will have an annual value of <span class="reportDollar">${dollarFormat.format(Math.round(retire.income.otherBen.annual[retire.income.otherBen.annual.findIndex(n => n > 0)]))}</span> in <strong>${new Date().getFullYear() + (demographics.otherBen.otherBenBeginAge - age)}</strong>. </p>`);
    }  
  }
  if (retire.invAccts) {
    if (retire.invAccts.saveAcct) {
      $('#results').append(`<p><h4>Savings & Money Market Accounts</h4>You currently have <span class="reportDollar">${dollarFormat.format(demographics.saveAcct.currentVal_saveAcct)}</span> in your savings/money market/cash deposit accounts, with plans to contribute <span class="reportDollar">${dollarFormat.format(demographics.saveAcct.annContr_saveAcct)}</span> annually until <span class="reportAge">${demographics.saveAcct.endAgeContr_saveAcct}</span>. These accounts will grow at a rate of ${percentFormat.format(demographics.saveAcct.annIntRate_saveAcct)}, which is ${(demographics.saveAcct.annIntRate_saveAcct / 100) > growthRate.inflation ? "more" : "less"} than the approximate inflation rate of ${percentFormat.format(growthRate.inflation)}.</p>`);
    }
    if (retire.invAccts.investmentAcct) {
      $('#results').append(`<p><h4>Investment/Brokerage Accounts</h4>These investments are currently worth <span class="reportDollar">${dollarFormat.format(demographics.investmentAcct.currentVal_investAcct)}</span>, with ongoing annual contributions estimated at <span class="reportDollar">${dollarFormat.format(demographics.investmentAcct.annContr_investAcct)}</span>. Contributions to these accounts are projected to end in <strong>${new Date().getFullYear() + (retire.retAge - age)}</strong>. You will first beginning drawing from this account in <strong>${retire.years.time.year[retire.invAccts.investmentAcct.withdrawal.findIndex(n => n > 0)]}</strong>, when it will be worth <span class="reportDollar">${dollarFormat.format(Math.round(retire.invAccts.investmentAcct.beginValue[retire.invAccts.investmentAcct.withdrawal.findIndex(n => n > 0)]))}</span>.</p>`);
    }
  }
  if (retire.tradAccts) {
    if (retire.tradAccts.tradEca) {
      $('#results').append(`<p><h4>Traditional Employee Contribution Accounts</h4>This account category may include a 401k, 403b, 457b, TSP, Safe Harbor 401k, or a Single 401k, amongst other similar accounts. The current total amount in holding for all of these accounts is <span class="reportDollar">${dollarFormat.format(Math.round(demographics.tradAccts.currentVal_tradAccts))}</span>. Your employer currently provides a matching contribution of <span class="reportDollar">${dollarFormat.format(Math.round(demographics.tradAccts.empContr_tradAccts))}</span> annually. you are contributing <span class="reportDollar">${dollarFormat.format(Math.round(demographics.tradAccts.annContr_tradAccts))}</span> annually. ${retire.retAge < 50 ? "" : "You do " + (demographics.tradAccts.catchUpContr_tradAccts == false ? "not" : "") + ' plan to make additional "catch up" contributions after the age of 50.'} You plan to stop contributing to these accounts at the age of <span class="reportAge">${demographics.tradAccts.endAgeContr_tradAccts}</span> in <strong>${new Date().getFullYear() + (demographics.tradAccts.endAgeContr_tradAccts - age)}</strong>. ${retire.retAge == false ? "" : "You should first draw from this account in <strong>" + retire.years.time.year[retire.tradAccts.tradEca.withdrawal.findIndex(n => n > 0)] + '</strong>, when it will be worth <span class="reportDollar">' + dollarFormat.format(Math.round(retire.tradAccts.tradEca.beginValue[Math.min((retire.tradAccts.tradEca.withdrawal.findIndex(n => n > 0) == -1) ? 1000 : retire.tradAccts.tradEca.withdrawal.findIndex(n => n > 0),(retire.tradAccts.tradEca.rmd.findIndex(n => n > 0) == -1) ? 1000 : retire.tradAccts.tradEca.rmd.findIndex(n => n > 0) )])) + "</span>."}</p>`);
    }
    if (retire.tradAccts.simple401) {
      $('#results').append(`<p><h4>Simple 401k</h4>The current total amount in holding for all of these accounts is <span class="reportDollar">${dollarFormat.format(Math.round(demographics.simple401.currentVal_simple401))}</span>. Your employer currently provides a matching contribution of <span class="reportDollar">${dollarFormat.format(Math.round(demographics.simple401.empContr_simple401))}</span> annually. you are contributing <span class="reportDollar">${dollarFormat.format(Math.round(demographics.simple401.annContr_simple401))}</span> annually. ${retire.retAge < 50 ? "" : "You do " + (demographics.simple401.catchUpContr_simple401 == false ? "not" : "") + ' plan to make additional "catch up" contributions after the age of 50.'} You plan to stop contributing to these accounts at the age of <span class="reportAge">${demographics.simple401.endAgeContr_simple401}</span> in <strong>${new Date().getFullYear() + (demographics.simple401.endAgeContr_simple401 - age)}</strong>. ${retire.retAge == false ? "" : "You should first draw from this account in <strong>" + (retire.tradAccts.simple401.withdrawal.findIndex(n => n > 0) == -1 ? retire.years.time.year[retire.tradAccts.simple401.rmd.findIndex(n => n > 0)] : retire.years.time.year[retire.tradAccts.simple401.withdrawal.findIndex(n => n > 0)]) + '</strong>, when it will be worth <span class="reportDollar">' + dollarFormat.format(Math.round(retire.tradAccts.simple401.beginValue[Math.min((retire.tradAccts.simple401.withdrawal.findIndex(n => n > 0) == -1) ? 1000: retire.tradAccts.simple401.withdrawal.findIndex(n => n > 0),(retire.tradAccts.simple401.rmd.findIndex(n => n > 0) == -1 ) ? 1000 : retire.tradAccts.simple401.rmd.findIndex(n => n > 0))])) + "</span>."}</p>`);
    }
    if (retire.tradAccts.simpleIra) {
      $('#results').append(`<p><h4>Simple IRA</h4>The current total amount in holding for all of these accounts is <span class="reportDollar">${dollarFormat.format(Math.round(demographics.simpleIra.currentVal_simpleIra))}</span>. Your employer currently provides a matching contribution of <span class="reportDollar">${dollarFormat.format(Math.round(demographics.simpleIra.empContr_simpleIra))}</span> annually. you are contributing <span class="reportDollar">${dollarFormat.format(Math.round(demographics.simpleIra.annContr_simpleIra))}</span> annually. ${retire.retAge < 50 ? "" : "You do " + (demographics.simpleIra.catchUpContr_simpleIra == false ? "not" : "") + ' plan to make additional "catch up" contributions after the age of 50.'} You plan to stop contributing to these accounts at the age of <span class="reportAge">${demographics.simpleIra.endAgeContr_simpleIra}</span> in <strong>${new Date().getFullYear() + (demographics.simpleIra.endAgeContr_simpleIra - age)}</strong>. ${retire.retAge == false ? "" : "You should first draw from this account in <strong>" + (retire.tradAccts.simpleIra.withdrawal.findIndex(n => n > 0) == -1 ? retire.years.time.year[retire.tradAccts.simpleIra.rmd.findIndex(n => n > 0)] : retire.years.time.year[retire.tradAccts.simpleIra.withdrawal.findIndex(n => n > 0)]) + '</strong>, when it will be worth <span class="reportDollar">' + dollarFormat.format(Math.round(retire.tradAccts.simpleIra.beginValue[Math.min((retire.tradAccts.simpleIra.withdrawal.findIndex(n => n > 0) == -1) ? 1000 : retire.tradAccts.simpleIra.withdrawal.findIndex(n => n > 0),(retire.tradAccts.simpleIra.rmd.findIndex(n => n > 0) == -1) ? 1000 : retire.tradAccts.simpleIra.rmd.findIndex(n => n > 0))])) + "</span>."}</p>`);
    }
    if (retire.tradAccts.tradIra) {
      $('#results').append(`<p><h4>Traditional IRA</h4>The current total amount in holding for all of your traditional IRAs is <span class="reportDollar">${dollarFormat.format(Math.round(demographics.tradIra.currentVal_tradIra))}</span>. Your employer currently provides a matching contribution of <span class="reportDollar">${dollarFormat.format(Math.round(demographics.tradIra.empContr_tradIra))}</span> annually. You plan to contribute ${Math.round(demographics.tradIra.annContr_tradIra) == 6000 ? "the maximum amount of" : ""} <span class="reportDollar">${dollarFormat.format(Math.round(demographics.tradIra.annContr_tradIra))}</span> annually. ${retire.retAge < 50 ? "" : "You do " + (demographics.tradIra.catchUpContr_tradIra == false ? "not" : "") + ' plan to make additional "catch up" contributions after the age of 50.'} You plan to stop contributing to these accounts at the age of <span class="reportAge">${demographics.tradIra.endAgeContr_tradIra}</span> in <strong>${new Date().getFullYear() + (demographics.tradIra.endAgeContr_tradIra - age)}</strong>. ${retire.retAge == false ? "" : "You should first draw from this account in <strong>" + retire.years.time.year[retire.tradAccts.tradIra.withdrawal.findIndex(n => n > 0)] + '</strong>, when it will be worth <span class="reportDollar">' + dollarFormat.format(Math.round(retire.tradAccts.tradIra.beginValue[Math.min((retire.tradAccts.tradIra.withdrawal.findIndex(n => n > 0) == -1) ? 1000 : retire.tradAccts.tradIra.withdrawal.findIndex(n => n > 0),(retire.tradAccts.tradIra.rmd.findIndex(n => n > 0) == -1) ? 1000 : retire.tradAccts.tradIra.rmd.findIndex(n => n > 0))])) + "</span>."}</p>`);
    }
  }
  if (retire.rothAccts) {
    if (retire.rothAccts.rothEca) {
      $('#results').append(`<p><h4>Roth Employee Contribution Accounts</h4>This account category may include a Roth 401k, Roth 403b, Roth 457b, or a Roth TSP amongst other similar accounts. The current total amount in holding for all of these accounts is <span class="reportDollar">${dollarFormat.format(Math.round(demographics.rothAccts.currentVal_rothAccts))}</span>. Your employer currently provides a matching contribution of <span class="reportDollar">${dollarFormat.format(Math.round(demographics.rothAccts.empContr_rothAccts))}</span> annually. You plan to contribute <span class="reportDollar">${dollarFormat.format(Math.round(demographics.rothAccts.annContr_rothAccts))}</span> annually. ${retire.retAge < 50 ? "" : "You do " + (demographics.rothAccts.catchUpContr_rothAccts == false ? "not" : "") + ' plan to make additional "catch up" contributions after the age of 50.'} You plan to stop contributing to these accounts at the age of <span class="reportAge">${demographics.rothAccts.endAgeContr_rothAccts}</span> in <strong>${new Date().getFullYear() + (demographics.rothAccts.endAgeContr_rothAccts - age)}</strong>. ${retire.retAge == false ? "" : "You should first draw from this account in <strong>" + retire.years.time.year[retire.rothAccts.rothEca.withdrawal.findIndex(n => n > 0)] + '</strong>, when it will be worth <span class="reportDollar">' + dollarFormat.format(Math.round(retire.rothAccts.rothEca.beginValue[Math.min(retire.rothAccts.rothEca.withdrawal.findIndex(n => n > 0))])) + "</span>."}</p>`);
    }
    if (retire.rothAccts.rothIra) {
      $('#results').append(`<p><h4>Roth IRA</h4>The current total amount in holding for all of these accounts is <span class="reportDollar">${dollarFormat.format(Math.round(demographics.rothIra.currentVal_rothIra))}</span>. You plan to contribute ${Math.round(demographics.rothIra.annContr_rothIra) == 6000 ? "the maximum amount of" : ""} <span class="reportDollar">${dollarFormat.format(Math.round(demographics.rothIra.annContr_rothIra))}</span> annually. ${retire.retAge < 50 ? "" : "You do " + (demographics.rothIra.catchUpContr_rothIra == false ? "not" : "") + ' plan to make additional "catch up" contributions after the age of 50.'} You plan to stop contributing to these accounts at the age of <span class="reportAge">${demographics.rothIra.endAgeContr_rothIra}</span> in <strong>${new Date().getFullYear() + (demographics.rothIra.endAgeContr_rothIra - age)}</strong>. ${retire.retAge == false ? "" : "You should first draw from this account in <strong>" + retire.years.time.year[retire.rothAccts.rothIra.withdrawal.findIndex(n => n > 0)] + '</strong>, when it will be worth <span class="reportDollar">' + dollarFormat.format(Math.round(retire.rothAccts.rothIra.beginValue[Math.min(retire.rothAccts.rothIra.withdrawal.findIndex(n => n > 0))])) + "</span>."}</p>`);
    }
  }

  $('#results').append(`<p><h3>Assumptions & Methodology</h3> <span id="methods">A model of this complexity is built on a variety of assumptions and numerous processes. Some of the most important and noteworthy of these design choices are presented for your information below:
    <ul>
      <li>All investments (to exclude savings accounts, and the income sources) grow at a rate of ${percentFormat.format(growthRate.sp500)}, which is the average annual growth rate for the S&P 500 between 2000 - 2019. This growth rate is applied through the age of 65, after which it is reduced to the average US inflation rate of ${percentFormat.format(growthRate.inflation)}. This reduction represents a transition from an aggressive portfolio to a conservative approach in retirement.</li>
      <li>ClockOut bases its estimates for how long you will live based on your birthday. For example, if you were born in 1970, then you would have a life expectancy of 67 years as a male, and 75 years as a female, with a standard deviation of 8 years for men, and 9 years for women. ClockOut applies 2 standard deviations to your age, which will ensure that adequate funds are available for 95% of those who use this tool.
      <li>For accounts from the Investment Category, ClockOut employs the following process for accruing and expensing funds:
        <ol>
          <li>Record withdrawals and Required Minimum Distributions</li>
          <li>The above deductions are assumed to happen at a fixed, monthly rate, so standard growth rates are accrued for those deductions, but at a reduced fraction of 5/12</li>
          <li>The overall growth rate is applied to the principal</li>
          <li>Personal and Employer contributions are accrued</li>
          <li>The reduced (5/12) growth rate is applied to the contributions</li>
          <li>Catch Up Contributions are accrued</li>
          <li>The reduced (5/12) growth rate is applied to the Catch Up contributions</li>
        </ol>
      </li>
      <li>In order to maximize your investments and minimize your tax burden, ClockOut processes your accounts in the following sequence: 
        <ol>
          <li>Income Accounts (Social Security, Pensions, Disability, Retirement Employment, etc)</li>
          <li>Savings Accounts/Money Markets - these have the lowest interest rates and are drawndown as soon as possible</li>
          <li>Investment/Brokerage Accounts - since these accounts do not receive preferential tax treatment, they are drawndown before your other accounts</li>
          <li>Traditional Employee Contribution Accounts - These accounts are drawndown next because they are more restrictive than their Roth equivalents, they are generally provided by an employer and may provide few investment options, and they include Required Minimum Distributions beginning at age of 72</li>
          <li>Simple 401k and Simple IRA - These accounts are very similar to the Traditional Employee Contribution Accounts and so receive the same treatment within ClockOut's algorithms</li>
          <li>Traditional IRA - This account is very similar to the Traditional Employee Contribution Accounts and so receive the same treatment within ClockOut's algorithms</li>
          <li>Roth Employee Contribution Accounts and Roth IRA - With their lower tax rates and more flexible rules for withdrawals, these accounts are held while you drawdown your traditional accounts. Roth accounts do not have Required Minimum Distributions, and since you have already paid taxes on the contributions, ClockOut is designed to draw from those contributions early if it will help you retire sooner.</li>
        </ol>
      </li>
      <li>At present, ClockOut cannot reinvest RMDs that exceed your annual income needs, and so those funds fall out of the system. This bug will not affect the majority of users and will be fixed in a future upgrade.</li>
    </ul>
  </p>
  <p><strong>Disclaimer:</strong> ClockOut does not guarantee any of the results it provides. It's an experimental tool, and any information it provides is only for planning purposes. ClockOut does not collect your personal information.</p></span>`);

  $('#tableView').append(`<div class="tableContainer"><table class="spreadsheet" id="resultsTable"></table></div>`);
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