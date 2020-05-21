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
  <table>
  </table>
  <button id="modalClose" disabled>Submit</button>
</div>
`);