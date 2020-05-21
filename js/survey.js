import {data} from './data.js';
import {investmentSelect} from './investChecklist.js';
// import {income} from './assets.js';

let currentTab = 0;
let tabOrder = [0];

/* Sets the active step marker */
let fixStepIndicator = () => {
  let x = document.getElementsByClassName('step');
  for (let i=0; i<x.length; i++) {
    // reduce so that classList.remove('active')
    x[i].className = x[i].className.replace(' active','');
  }
  $(x[tabOrder.indexOf(currentTab)-1]).addClass('active');
  // $(x[tabOrder.indexOf(currentTab)-1]).addClass('finish');
}

/* Turns on the active tab in the survey */
let showTab = (n) => {
  let x = document.getElementsByClassName('tab');
  if (x[n]) {
    x[n].style.display = 'block';
    if (n == 0) {
      document.getElementById('prevBtn').style.display = "none";
      // document.getElementById('prevBtn').disabled = true;
    } else {
      document.getElementById('prevBtn').style.display = "inline";
      // document.getElementById('prevBtn').disabled = false;
    }
    if (n > 0 && n == (Math.max.apply(null,tabOrder))) {
      document.getElementById('nextBtn').innerHTML = "Submit";
    } else {
      document.getElementById('nextBtn').innerHTML = "Next";
    }
    fixStepIndicator();
  }
  $('input:first').select();
}
showTab(currentTab);
investmentSelect();

/* Creates progress markers for the form pages*/
let accountTypes = () => {
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

window.demographics = () => {
  let inputs = $("#personalDetails :input");
  let details = {};
  for (let i=0;i<inputs.length;i++) {
    // data.demographics[inputs[i].id] = inputs[i].value;
    details[inputs[i].id] = inputs[i].value;
  }
  return details;
}

window.activeItems = () => {
  let $options = $('.accountTypes');
  for (let i=0; i<$options.length; i++) {
    if ($options[i].checked) {
      data[$options[i].classList[1]].active = true;
    }
  };
};

window.nextPrev = (n) => {
  let x = document.getElementsByClassName('tab');
  // if (n == 1 && !validateForm()) return false;
  if(currentTab == 0) {
    accountTypes();
    demographics();
    activeItems();
  }
  x[currentTab].style.display = 'none';
  currentTab = tabOrder[tabOrder.indexOf(currentTab)+n];
  if (!currentTab) {
    harvest();
    // window.location.href = "results.html";
    // income();
  }
  if (x[currentTab]) {
    showTab(currentTab);
    x[currentTab].getElementsByTagName('input')[0].select();
    // window.scrollTo(0,0);
  }
}

function validateForm() {
  // This function deals with validation of the form fields
  let x, y, blank, valid = true;
  x = document.getElementsByClassName("tab");
  let z = x[currentTab];
  y = $(z).find('select,input:not(.monthlyCalc):not(.accountTypes):not(":input[type=radio]"):not(.retSalCalcVals)');
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

window.harvest = () => {
  let $accountTypes = $('.accountTypes:checked');
  var dataTest = {};
  for (let i=0; i<$('.tab').length; i++) {
    // if ($($('.accountTypes:checked')))
    dataTest[$($('.tab')[i]).attr("id")] = {};
    let $temp = $($('.tab')[i]).find(".data");
    for (let j=0; j<$temp.length; j++) {
      dataTest[$($('.tab')[i]).attr("id")][$($temp[j]).attr("id")] = Number($($temp[j]).val()) || $($temp[j]).val();
      // console.log($($temp[j]).val());
    }
  }
  console.log($accountTypes);
  const invCategories = Object.keys(data);
  for (let i=1; i<invCategories.length; i++) {
    let tempKeys = Object.keys(data[invCategories[i]]);
    for (let j=0; j<tempKeys.length; j++) {
      if (tempKeys[j] == 'active') {continue;}
      if (document.getElementById(tempKeys[j]).value == '') {continue;}
      data[invCategories[i]][tempKeys[j]] = Number(document.getElementById(tempKeys[j]).value) || document.getElementById(tempKeys[j]).value;
      if (document.getElementById(tempKeys[j]).type == 'radio') {
        document.getElementById(tempKeys[j]).checked ? data[invCategories[i]][tempKeys[j]] = true : data[invCategories[i]][tempKeys[j]] = false;
      }
    }
  }
}

export {currentTab, data};