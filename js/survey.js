$(document).ready(function(){

// Need to figure out the validation without reloading the page issue
window.demographics = function(form) {
  if (form.checkValidity()) {
    data.dob = form.dob.value;
    data.gender = form.gender.value;
    data.salary = form.salary.value;
    data.retAge = form.retAge.value;
    document.getElementById('married').checked ? data.married = 1 : data.married = 0;
    data.state = form.state.value;
  } else {alert("Fill the required fields");}
  console.log(data);
}



});