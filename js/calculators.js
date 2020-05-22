import {currentTab, demographics} from './survey.js';
import {dollarFormat} from './numberFormats.js';

document.addEventListener('DOMContentLoaded', function() {
  const details = demographics();

// ecaModal Components
window.ecaModalCalc = (e) => {
  $(e).parent().last().find('.modalSalary').text(dollarFormat.format(details.salary));
  $(e).parent().next().find('.ecaContAmount').val(parseInt(Math.round(details.salary * (e.value/100) > 19500 ? 19500 : details.salary * (e.value/100))));
  ecaModalTotal();
};

window.ecaModalTotal = (e) => {
  let ecaContAmount = 0;
  $('.ecaContAmount').each(function() {
    if ($(this).val()) {
      ecaContAmount += parseInt($(this).val());
      }
  });
  $('.modalTotal').text(dollarFormat.format(ecaContAmount));
  if (ecaContAmount > 19500) {
    $('.modalTotal').css('color','red');
    $('#modalClose').prop('disabled',true);
  } else {
    $('.modalTotal').css('color','black');
    $('#modalClose').prop('disabled',false);
  }
};

$('#modalClose').click(()=>{
  let $values = $('#ecaModal .ecaContAmount');
  document.getElementById('annContr_tradAccts').value = $values[0].value;
  document.getElementById('annContr_rothAccts').value = $values[1].value;
  document.getElementById('annContr_simpleIra').value = $values[2].value;
  document.getElementById('annContr_simple401').value = $values[3].value;
  $('#ecaModal').toggle();
});

// simpleModal Components
window.simpleModalCalc = (e) => {
  e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
  e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 13500 ? 13500 : details.salary * (e.value/100)));
  simpleModalTotal();
}

window.simpleModalTotal = (e) => {
  let rothValue = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
  let tradValue = +parseInt(document.getElementById('annContr_simple401').value) || 0;
  let roth = document.getElementById('annContr_simpleIra');
  let trad = document.getElementById('annContr_simple401');
  let total = rothValue + tradValue;
  $('.simpleModalTotal').text(dollarFormat.format(total));
  if (total > 13500) {
    $('.simpleModalTotal').css('color','red');
    $('#simpleModalClose').prop('disabled',true);
    roth.classList.add('invalid');
    trad.classList.add('invalid');
  } else {
    $('.simpleModalTotal').css('color','black');
    $('#simpleModalClose').prop('disabled',false);
    roth.classList.remove('invalid');
    trad.classList.remove('invalid');
  }
  simpleRetCalc();
};

window.simpleCalc = (e) => {
  let rothValue = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
  let tradValue = +parseInt(document.getElementById('annContr_simple401').value) || 0;
  let roth = document.getElementById('annContr_simpleIra');
  let trad = document.getElementById('annContr_simple401');
  let total = rothValue + tradValue;
  if (total > 13500) {
    roth.classList.add('invalid');
    trad.classList.add('invalid');
  } else if (total <= 13500) {
    roth.classList.remove('invalid');
    trad.classList.remove('invalid');
  }
  simpleRetCalc();
}

$('#simpleModalClose').click(()=>{
  let $values = $('#simpleModal .simpleContAmount');
  document.getElementById('annContr_simpleIra').value = $values[2].value;
  document.getElementById('annContr_simple401').value = $values[3].value;
  $('#simpleModal').toggle();
});

window.simpleRetCalc = () => {
  let simpleIra = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
  let simple401 = +parseInt(document.getElementById('annContr_simple401').value) || 0;
  let total = simpleIra + simple401;
  let $values = $('#simpleModal .simpleContAmount');
  console.log($values);
  let range = document.getElementsByClassName('tab')[currentTab];
  let effects = range.querySelectorAll("[id^='annualCont']");
  if (total > 13500) {
    effects.forEach(a => {
      a.classList.add('invalid');
    });
    $values[0].value = simpleIra;
    $values[1].value = simple401;
    ecaModalTotal();
    effects.forEach(a => {
      a.classList.remove('invalid');
    });
    $('#simpleModal').toggle();
  } else if (total <= 13500) {
    effects.forEach(a => {
      a.classList.remove('invalid');
    });
  }
}

// Calculators
  window.ecaCalc = (e) => {
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 57000 ? 57000 : details.salary * (e.value/100)));
    e.parentNode.lastChild.classList.remove('invalid');
  }
  
  window.ecaPersCalc = (e) => {
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 19500 ? 19500 : details.salary * (e.value/100)));
    retCalc();
    e.parentNode.lastChild.classList.remove('invalid');
  }

  window.iraCalc = (e) => {
    let rothValue = +parseInt(document.getElementById('annContr_rothIra').value) || 0;
    let tradValue = +parseInt(document.getElementById('annContr_tradIra')) || 0;
    let roth = document.getElementById('annContr_rothIra');
    let trad = document.getElementById('annContr_tradIra');
    let total = rothValue + tradValue;
    if (total > 6000) {
      roth.classList.add('invalid');
      trad.classList.add('invalid');
      alert(`Total combined annual contributions to Roth and Traditional IRAs cannot exceed $6,000. Your total is currently ${dollarFormat.format(total)}.`);
    } else if (total <= 6000) {
      roth.classList.remove('invalid');
      trad.classList.remove('invalid');
    }
  };

  // Calc for multiplying monthly value by 12
  window.monthlyCalc = (e) => {
    e.parentNode.lastChild.value = parseInt(e.value * 12);
    e.parentNode.lastChild.classList.remove('invalid');
  }
  
  window.retSalCalc = () => {
  let sum = 0;
  $('.retSalCalcVals:not(.total)').each(function() {
    sum += Number($(this).val());
  });
  $('#retSalTotal').val(sum);
  };

  $('#retSalCalcClose').click((event)=>{
    let sum = 0;
    $('.retSalCalcVals:not(.total)').each(function() {
      sum += Number($(this).val());
    });
    if (sum != 0) {
      $('#retSal').val(sum);
    }
    $('#retSalCalc').toggle();
    event.preventDefault();
  });

  window.retCalc = (e) => {
    let trad = +parseInt(document.getElementById('annContr_tradAccts').value) || 0;
    let roth = +parseInt(document.getElementById('annContr_rothAccts').value) || 0;
    let simpleIra = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
    let simple401 = +parseInt(document.getElementById('annContr_simple401').value) || 0;
    let total = trad + roth + simpleIra + simple401;
    let $values = $('#ecaModal .ecaContAmount');
    let range = document.getElementsByClassName('tab')[currentTab];
    let effects = range.querySelectorAll("[id^='annualCont']");
    if (total > 19500) {
      effects.forEach(a => {
        a.classList.add('invalid');
      });
      $values[0].value = trad;
      $values[1].value = roth;
      $values[2].value = simpleIra;
      $values[3].value = simple401;
      ecaModalTotal();
      effects.forEach(a => {
        a.classList.remove('invalid');
      });
      $('#ecaModal').toggle();
    } else if (total <= 19500) {
      effects.forEach(a => {
        a.classList.remove('invalid');
      });
    }
  };
  
});