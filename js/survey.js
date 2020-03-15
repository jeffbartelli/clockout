$(document).ready(function(){

window.harvest = function(form) {
  let inputs = document.getElementsByTagName('input');
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
  // console.log(data);
}

window.ecaCalc = function(e) {
  $(e).addClass('thisCalc');
  // e.className += " thisCalc";
  document.querySelector('.ecaCalculatorSalary').parentNode.lastChild.innerHTML = data.salary;
  document.getElementById(e.parentNode.htmlFor).value = Math.round(
    data.salary * (e.value/100) > 57000 ? 57000 : data.salary * (e.value/100));
  $(e).removeClass('thisCalc');
    // Need a separate calculator or logic for Roth accounts.
}
});