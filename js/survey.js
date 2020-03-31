$(document).ready(function(){

window.investmentSelect = () => {
  let $accounts = $('legend');
  for (let i=1; i<$accounts.length; i++) {
    $('.investmentSelect').append(
      $('<p/>').append(
        $('<label/>')
          .text($accounts[i].innerHTML)
          .prepend(
            $('<input/>')
              .attr('type','checkbox')
              .addClass('accountTypes') 
  )))}
  $('.investmentSelect').find('*').filter(':input:first').prop('checked','true').prop('disabled','true');
}
investmentSelect();

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
  // console.log(data);
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
