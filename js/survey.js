import {data, states} from './data.js';

let currentTab = 0;

document.addEventListener('DOMContentLoaded', function() {

/* Creates progress markers for the form pages*/
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

/* Sets the active step marker */
window.fixStepIndicator = () => {
  let x = document.getElementsByClassName('step');
  for (let i=0; i<x.length; i++) {
    x[i].className = x[i].className.replace(' active','');
  }
  $(x[tabOrder.indexOf(currentTab)-1]).addClass('active');
}

/* Turns on the active tab in the survey */
window.showTab = (n) => {
  let x = document.getElementsByClassName('tab');
  if (x[n]) {
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
$('input:first').select();

window.nextPrev = (n) => {
  let x = document.getElementsByClassName('tab');
  if (n == 1 && !validateForm()) return false;
  if(currentTab == 0) {
    accountTypes();
    demographics();
    activeItems();
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
  let z = x[currentTab];
  y = z.querySelectorAll('input[type=number],input[type=date],select,input:not(.accountTypes):not(.monthlyCalc)');
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
  return valid;
}

window.demographics = () => {
  let inputs = $("#personalDetails :input");
  for (let i=0;i<inputs.length;i++) {
    data.demographics[inputs[i].id] = inputs[i].value;
  }
}

window.activeItems = () => {
  let $options = $('.accountTypes');
  for (let i=0; i<$options.length; i++) {
    if ($options[i].checked) {
      data[$options[i].classList[1]].active = true;
    }
  };
};

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
});

export {currentTab, data};