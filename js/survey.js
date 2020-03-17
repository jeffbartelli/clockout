$(document).ready(function(){

window.harvest = function(form) {
  let inputs = $(document.getElementsByTagName('input')).not('.accountTypes').not('.ecaCalculator');
  for (let i=0;i<inputs.length;i++) {
    data[inputs[i].id] = form[inputs[i].id].value;
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

window.ecaCalc = function(e) {
  $(e).addClass('thisCalc');
  // e.className += " thisCalc";
  e.parentNode.lastChild.innerHTML = data.salary;
  document.getElementById(e.parentNode.htmlFor).value = Math.round(
    data.salary * (e.value/100) > 57000 ? 57000 : data.salary * (e.value/100));
  $(e).removeClass('thisCalc');
    // Need a separate calculator or logic for Roth accounts.
}

let currentTab = 0;
window.showTab = (n) => {
  let x = document.getElementsByClassName('tab');
  x[n].style.display = 'block';
  if (n == 0) {
    document.getElementById('prevBtn').style.display = "none";
  } else {
    document.getElementById('prevBtn').style.display = "inline";
  }
  if (n == (x.length -1)) {
    document.getElementById('nextBtn').innerHTML = "Submit";
  } else {
    document.getElementById('nextBtn').innerHTML = "Next";
  }
  // fixStepIndicator(n);
}
showTab(currentTab);


let tabOrder = [0];
window.accountTypes = (form) => {
  let test = document.getElementsByClassName('accountTypes');
  for(let i=0; i<test.length;i++){
    if (test[i].checked) {
      tabOrder.push(i+1);
    }
  }
}

window.demographics = (form) => {
  let inputs = $("#demographics :input").not(".accountTypes");
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
}

window.nextPrev = (n) => {
  if(currentTab == 0) {
    accountTypes();
    demographics();
  }
  let x = document.getElementsByClassName('tab');
  // if (n == 1 && !validateForm()) return false;
  x[currentTab].style.display = 'none';

  if(currentTab >= Math.max.apply(null,tabOrder)) {
    // harvest();
    // Need to figure out how to successfully trigger harvest at this point
  }
  currentTab = tabOrder[tabOrder.indexOf(currentTab)+n];
  // console.log(currentTab);
  showTab(currentTab);
}
});