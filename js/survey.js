$(document).ready(function(){

let tabOrder = [0];
window.accountTypes = () => {
  tabOrder = [0];
  let accounts = $('.accountTypes');
  for(let i=0; i<accounts.length;i++){
    if (accounts[i].checked) {
      tabOrder.push(i+1);
    }
  }
  let progressMarker = document.createElement('span');
  $(progressMarker).addClass('step');
  let markerCount = document.getElementById('progress').childElementCount;
  let tabCount = tabOrder.length-1;
  if(tabCount >= markerCount) {
    for(let i=0; i<tabCount-markerCount; i++) {
      $('#progress').append(progressMarker.cloneNode(true));
    }
  } else if (tabCount < markerCount) {
    for(let i=0; i<markerCount-tabCount; i++) {
      let el = $('#progress:last-child');
      el.remove();
    }
  }
  document.getElementsByClassName('step')[0].classList.add('active');
}

window.fixStepIndicator = () => {
  let x = document.getElementsByClassName('step');
  for (i=0; i<x.length; i++) {
    x[i].className = x[i].className.replace(' active','');
  }
  $(x[tabOrder.indexOf(currentTab)-1]).addClass('active');
}

let currentTab = 0;
window.showTab = (n) => {
  let x = document.getElementsByClassName('tab');
  if (!x[n]) {
    console.log('trigger');
  } else {
    x[n].style.display = 'block';
    if (n == 0) {
      document.getElementById('prevBtn').style.display = "none";
    } else {
      document.getElementById('prevBtn').style.display = "inline";
    }
    if (n > 0 && n == (Math.max.apply(null,tabOrder))) {
      document.getElementById('nextBtn').innerHTML = "Submit";
    } else {
      document.getElementById('nextBtn').innerHTML = "Next";
    }
    fixStepIndicator();
  }
}
showTab(currentTab);
$('input:first').select()

window.nextPrev = (n) => {

  let x = document.getElementsByClassName('tab');
  if (n == 1 && !validateForm()) return false;
  if(currentTab == 0) {
    accountTypes();
    demographics();
  }
  x[currentTab].style.display = 'none';

  currentTab = tabOrder[tabOrder.indexOf(currentTab)+n];

  if (!currentTab) {
    harvest();
  // NEED A REDIRECT HERE TO THE NEXT SCREEN

  }
  if (x[currentTab]) {
    showTab(currentTab);
    x[currentTab].getElementsByTagName('input')[0].select();
    window.scrollTo(0,0);
  }

}

function validateForm() {
  // This function deals with validation of the form fields
  let x, y, blank, valid = true;
  x = document.getElementsByClassName("tab");
  let z = x[currentTab].getElementsByClassName('userInput');
  for (let j=0; j<z.length; j++) {
    y = z[j].querySelectorAll('input[type=number],input[type=date],select');
    for (let i=0; i<y.length; i++) {
      if (y[i].value != '') {blank = false;}

    }
    if (blank == false) {
      for (let k=0; k<y.length; k++) {
        if (y[k].value == '') {
          if(y[k].classList.contains(' invalid')) {
            continue;
          } else {
            y[k].className += " invalid";
            valid = false;
          }
        }
      }
      blank = true;
    } 
  }
  return valid;
}

window.demographics = (form) => {
  let inputs = $("#personalDetails :input");
  for (let i=0;i<inputs.length;i++) {
    data[inputs[i].id] = inputs[i].value;
  }
  console.log(data);
}

let dollarFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

window.ecaCalc = (e) => {
  $(e).addClass('thisCalc');
  e.parentNode.lastChild.innerHTML = dollarFormat.format(data.salary);
  document.getElementById(e.parentNode.htmlFor).value = parseInt(Math.round(data.salary * (e.value/100) > 57000 ? 57000 : data.salary * (e.value/100)));
  $(e).removeClass('thisCalc');
    // Need a separate calculator or logic for Roth accounts.
}

window.monthlyCalc = (e) => {
  e.parentNode.lastChild.value = parseInt(e.value * 12);
}

window.iraCalc = (e) => {
  let roth = +parseInt(document.getElementById('annualContRothIra').value) || 0;
  let trad = +parseInt(document.getElementById('annualContTradIra')) || 0;
  let total = roth + trad;
  if (total > 6000) {
    roth.className += " invalid";
    trad.className += " invalid";
    alert(`Total combined annual contributions to Roth and Traditional IRAs cannot exceed $6,000. Your total is currently ${dollarFormat.format(total)}.`);
  } else if (total <= 6000) {
    roth.className = '';
    trad.className = '';
  }
}

window.simpleCalc = (e) => {
  let roth = +parseInt(document.getElementById('annualContSimpleIra').value) || 0;
  let trad = +parseInt(document.getElementById('annualContSimple401').value) || 0;
  let total = roth + trad;
  if (total > 13500) {
    roth.className += " invalid";
    trad.className += " invalid";
    alert(`Total combined annual contributions to Simple IRA and Simple 401k cannot exceed $13,500. Your total is currently ${dollarFormat.format(total)}. Remember, this total is included in the larger Employer Contribution Accounts (401k, 403b, 457b, Simple) contribution limits.`);
  } else if (total <= 13500) {
    roth.className = '';
    trad.className = '';
  }
}

window.retCalc = (e) => {
  let trad401 = +parseInt(document.getElementById('annualContTrad401').value) || 0;
  let roth401 = +parseInt(document.getElementById('annualContRoth401').value) || 0;
  let trad403 = +parseInt(document.getElementById('annualContTrad403').value) || 0;
  let roth403 = +parseInt(document.getElementById('annualContRoth403').value) || 0;
  let trad457 = +parseInt(document.getElementById('annualContTrad457').value) || 0;
  let roth457 = +parseInt(document.getElementById('annualContRoth457').value) || 0;
  let single401 = +parseInt(document.getElementById('annualContSingle401').value) || 0;
  let safe401 = +parseInt(document.getElementById('annualContSafeHarbor401').value) || 0;
  let simpleIra = +parseInt(document.getElementById('annualContSimpleIra').value) || 0;
  let simple401 = +parseInt(document.getElementById('annualContSimple401').value) || 0;
  let total = trad401 + roth401 + trad403 + roth403 + trad457 + roth457 + single401 + safe401 + simpleIra + simple401;
  let range = document.getElementsByClassName('tab')[currentTab];
  let effects = range.querySelectorAll("[id^='annualCont']");
  if (total > 19500) {
    effects.forEach(a => {
      a.className += " invalid";
    })
    alert(`Total combined annual contributions cannot exceed $19,500. This total is comprised of all 401k, 403b, 457b, and Simple accounts you maintain. Your current projected annual contributions are as follows: \n Traditional 401k: ${dollarFormat.format(trad401)} \n Roth 401k: ${dollarFormat.format(roth401)} \n Single 401k: ${dollarFormat.format(single401)} \n Safe Harbor 401k: ${dollarFormat.format(safe401)} \n Traditional 403b: ${dollarFormat.format(trad403)} \n Roth 403b: ${dollarFormat.format(roth403)} \n Traditional 457: ${dollarFormat.format(trad457)} \n Roth 457: ${dollarFormat.format(roth457)} \n Simple IRA: ${dollarFormat.format(simpleIra)} \n Simple 401k: ${dollarFormat.format(simple401)} \n Total: ${dollarFormat.format(total)}\nPlease reduce these values to less than $19,501.`);
  } else if (total <= 19500) {
    effects.forEach(a => {
      a.className = '';
    })
  }
}

window.harvest = (form) => {
  // INPUTS DOES NOT INCLUDE SELECT ITEMS. EXPAND DEFINITION TO INCLUDE SELECT, AND TO HANDLE CHECKBOXES CORRECTLY. 
  let inputs = document.querySelectorAll('input:not(.accountTypes):not(.ecaCalculator),select');
  for (let i=0; i<inputs.length; i++) {
  }
  for (let i=0;i<inputs.length;i++) {
    data[inputs[i].id] = inputs[i].value;

    if(inputs[i].type.toLowerCase() == 'checkbox') {
      if(inputs[i].checked) {
        data[inputs[i].id] = 1;
      } else {
        data[inputs[i].id] = 0;
      }
    }
  }    
  let dropdowns = document.getElementsByTagName('select');
  for (let i=0;i<dropdowns.length;i++){
    data[dropdowns[i].id] = dropdowns[i].value;
  }
}

// STATE DROPDOWN
let select = document.querySelector('#retState');
let selectDef = document.createElement('option');
selectDef.setAttribute('selected','');
selectDef.setAttribute('disabled','');
selectDef.textContent = '--';
select.appendChild(selectDef);
for (let i=0; i<states.length; i++) {
  let el = document.createElement('option');
  el.textContent = states[i];
  el.value = states[i];
  select.appendChild(el);
}

});



