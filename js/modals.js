import {dollarFormat} from './numberFormats.js';
import {demographics} from './survey.js';


$('#workSpace').after(`<div id="retSalCalc">
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
          <span class="modalSalary"></span> =</td>\
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
          $('<span/>', {'class': 'simpleModalTotal'})
        )
      )
    )
    $('.modalSalary').each(function() {
      $(this).text(dollarFormat.format(details.salary));
    });     
  }
  simpleModal();

});