import {dollarFormat} from './numberFormats.js';
import {demographics} from './survey.js';


$('#survey').append(`<div id="retSalCalc" class="slide-in">
<div class="controls">
<p>Enter annual totals for each category. The total amount will represent the net salary (in today's dollars) that you will need in retirement.</p>
<p><input type="number" id="housing" placeholder="Housing Budget" class="retSalCalcVals" onchange="retSalCalc()"></p>
<p><input type="number" id="transport"  class="retSalCalcVals" placeholder="Transportation Budget" onchange="retSalCalc()"></p> 
<p><input type="number" id="groceries" class="retSalCalcVals" placeholder="Grocery & Dining Budget" onchange="retSalCalc()"></p> 
<p><input type="number" id="health" class="retSalCalcVals" placeholder="Healthcare Budget" onchange="retSalCalc()"></p>
<p><input type="number" id="travel" class="retSalCalcVals" placeholder="Travel/Vacation Budget" onchange="retSalCalc()"></p>
<p><input type="number" id="other" class="retSalCalcVals" placeholder="Other Expenses" onchange="retSalCalc()"></p>
<p><input type="number" id="retSalTotal" class="retSalCalcVals total" placeholder="Total Annual Expenses" value=""></p>
<button id="retSalCalcClose">Close</button>
</div>
</div>
</div>

<div id="ecaModal" class="modal">
  <p>Total combined annual contributions to ALL of your Employer Contribution Accounts cannot exceed $19,500 ($13,500 for Simple accounts). Redistribute your contributions below and the amounts will be updated within the survey. Note: You can enter a percentage of your salary or an overall amount.</p>
  <table class="ecaModalFields">
  </table>
  <button id="modalClose" disabled>Submit</button>
</div>

<div id="simpleModal" class="">
  <p>Total combined annual contributions for All Simple accounts cannot exceed $13,500. Redistribute your contributions below. Note: You can enter a percentage of your salary or an overall amount.</p>
  <table class="simpleModalFields">
  </table>
  <button id="simpleModalClose" disabled>Submit</button>
</div>

<div id="iraModal" class="">
  <p>Total combined annual contributions for all traditional and roth Individual Retirement Accounts cannot exceed $6,000. Redistribute your contributions below.</p>
  <table class="iraModalFields">
  </table>
  <button id="iraModalClose" disabled>Submit</button>
</div>
`);

$('#demographics .survey-header').after(`
  <div id="instructionModal" class="">
    <div>
    <h4 style="text-align:center">Clockout Survey Instructions</h4>
    <ol>
      <li>Enter your personal information on the left</li>
      <li>Select Income & Benefits that apply to you</li>
      <li>Select Investment Accounts that apply to you</li>
      <li>Enter your financial information on each page in the interview</li>
      <li>If you have two accounts within the same type (i.e. Two Traditional IRAs) then enter the combined totals for those accounts</li>
    </ol>
    <h4>If you have your financial information available, the ClockOut interview should take less than 5 minutes. An overall report will be provided at the end of the interview.</h4>
    <button id="instructionModalClose">Got It</button>
    <label class="optOut" for="instructOpt"><input type="checkbox" id="instructOpt" onclick="optOut();"> Do not show this message again</label>
    </div>
  </div>
  `);

document.addEventListener('DOMContentLoaded', function() {
  const details = demographics();

  var ecaModal = () => {
    let $accounts = $('.sectionHeader');
    for (let i=13; i<17; i++) {
      $('.ecaModalFields').append(
        $('<tr/>').append(
          $('<td/>', {'text': $accounts[i].innerHTML})).append(`
          <td>\
            <input type="number" class="percent ecaCalculator" min="0" max="0" placeholder="0.0" onchange="ecaModalCalc(this)">% x\
            <span class="modalSalary"></span> =</td>\
            <td>\
            <input type="number" class="ecaContAmount" 
            onchange="ecaModalCalc(this)"
            placeholder="0">\
            </td>`));   
    }
    $('.ecaModalFields').append(
      $('<tr/>').append(
        $('<td/>')
      ).append(
        $('<td/>')
        .text('Total:')
      ).append(
        $('<td/>').append(
          $('<span/>', {'class': 'modalTotal'})
        )
      )
    )
    $('.modalSalary').each(function() {
      $(this).text(dollarFormat.format(details.salary));
    });  
  }
  ecaModal();

  var simpleModal = () => {
    let $accounts = $('.sectionHeader');
    for (let i=15; i<17; i++) {
      $('.simpleModalFields').append(
        $('<tr/>').append(
          $('<td/>', {'text': $accounts[i].innerHTML})).append(`
          <td>\
          <input type="number" class="percent ecaCalculator" min="0" max="0" placeholder="0.0" onchange="simpleModalCalc(this)">% x\
          <span class="modalSimpleSalary"></span> =</td>\
          <td>\
          <input type="number" class="simpleContAmount" 
          onchange="simpleModalCalc(this)"
          placeholder="0">\
          </td>`));   
    }
    $('.simpleModalFields').append(
      $('<tr/>').append(
        $('<td/>')
      ).append(
        $('<td/>')
        .text('Total:')
      ).append(
        $('<td/>').append(
          $('<span/>', {'class': 'simpleTotal'})
        )
      )
    ).append(
      $('<tr/>').append(
        $('<td/>')
      ).append(
        $('<td/>')
        .text('ECA Total:')
      ).append(
        $('<td/>').append(
          $('<span/>', {'class': 'bigTotal'})
        )
      )
    )
    $('.modalSimpleSalary').each(function() {
      $(this).text(dollarFormat.format(details.salary));
    });     
  }
  simpleModal();

  var iraModal = () => {
    let $accounts = $('.sectionHeader');
    for (let i=11; i<13; i++) {
      $('.iraModalFields').append(
        $('<tr/>').append(
          $('<td/>', {'text': $accounts[i].innerHTML})).append(`
            <td>\
            <input type="number" class="iraContAmount"
            onchange="iraModalTotal(this);" 
            placeholder="0">\
            </td>`));   
    }
    $('.iraModalFields').append(
      $('<tr/>').append(
        $('<td/>')
        .text('Total:')
      ).append(
        $('<td/>').append(
          $('<span/>', {'class': 'iraTotal'})
        )
      )
    )
    $('.modalIraSalary').each(function() {
      $(this).text(dollarFormat.format(details.salary));
    });  
  }
  iraModal();

  window.instructionModal = () => {
    if (localStorage.optOut === false || localStorage.optOut === undefined) {
      $('#instructionModal').fadeIn();
    }
  }

  window.optOut = () => {
    $('#instructOpt').prop("checked") ? localStorage.optOut = true : localStorage.optOut = false;
  }

});