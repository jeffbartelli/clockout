import {currentTab, demographics} from './survey.js';
import {dollarFormat} from './numberFormats.js';

document.addEventListener('DOMContentLoaded', function() {
  // const details = demographics();

  // ecaModal Components
  window.ecaPersCalc = (e) => {
    const details = demographics();
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 19500 ? 19500 : details.salary * (e.value/100)));
    retCalc();
    e.parentNode.lastChild.classList.remove('invalid');
  }

  window.retCalc = (e) => {
    let trad = +parseInt(document.getElementById('annContr_tradAccts').value) || 0;
    let roth = +parseInt(document.getElementById('annContr_rothAccts').value) || 0;
    let simpleIra = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
    let simple401 = +parseInt(document.getElementById('annContr_simple401').value) || 0;
    let total = trad + roth + simpleIra + simple401;
    let $values = $('#ecaModal .ecaContAmount');
    let range = document.getElementsByClassName('tab')[currentTab];
    let effects = range.querySelectorAll("[id^='annContr']");
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

  window.ecaCalc = (e) => {
    const details = demographics();
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 57000 ? 57000 : details.salary * (e.value/100)));
    e.parentNode.lastChild.classList.remove('invalid');
  }

  window.ecaModalCalc = (e) => {
    const details = demographics();
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
    return ecaContAmount;
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
  window.simplePersCalc = (e) => {
    const details = demographics();
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 13500 ? 13500 : details.salary * (e.value/100)));
    simpleRetCalc();
    e.parentNode.lastChild.classList.remove('invalid');
  }

  window.simpleRetCalc = () => {
    let simpleIra = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
    let simple401 = +parseInt(document.getElementById('annContr_simple401').value) || 0;
    let total = simpleIra + simple401;
    let $values = $('#simpleModal .simpleContAmount');
    let range = document.getElementsByClassName('tab')[currentTab];
    let effects = range.querySelectorAll("[id^='annContr']");
    if (total > 13500) {
      effects.forEach(a => {
        a.classList.add('invalid');
      });
      $values[0].value = simpleIra;
      $values[1].value = simple401;
      simpleModalTotal();
      effects.forEach(a => {
        a.classList.remove('invalid');
      });
      $('#simpleModal').toggle();
    } else if (total <= 13500) {
      effects.forEach(a => {
        a.classList.remove('invalid');
      });
    }
  };

  window.simpleModalCalc = (e) => {
    const details = demographics();
    $(e).parent().last().find('.modalSimpleSalary').text(dollarFormat.format(details.salary));
    $(e).parent().next().find('.simpleContAmount').val(parseInt(Math.round(details.salary * (e.value/100) > 13500 ? 13500 : details.salary * (e.value/100))));
    simpleModalTotal();
  };

  window.simpleModalTotal = (e) => {
    let simpleContAmount = 0;
    let ecaTotal = (+parseInt(document.getElementById('annContr_tradAccts').value) || 0) + (+parseInt(document.getElementById('annContr_rothAccts').value) || 0);
    $('.simpleContAmount').each(function() {
      if ($(this).val()) {
        simpleContAmount += parseInt($(this).val());
        ecaTotal += parseInt($(this).val());
      }
    });
    $('.simpleTotal').text(dollarFormat.format(simpleContAmount));
    $('.bigTotal').text(dollarFormat.format(ecaTotal));
    if (ecaTotal > 18500) {
      $('.bigTotal').css('color','red');
      $('#simpleModalClose').prop('disabled',true);
    } else {
      $('.bigTotal').css('color','black');
      $('#simpleModalClose').prop('disabled',false);
    }
    if (simpleContAmount > 13500) {
      $('.simpleTotal').css('color','red');
      $('#simpleModalClose').prop('disabled',true);
    } else {
      $('.simpleTotal').css('color','black');
      $('#simpleModalClose').prop('disabled',false);    
    }
  };
    
  $('#simpleModalClose').click(()=>{
    let $values = $('#simpleModal .simpleContAmount');
    document.getElementById('annContr_simpleIra').value = $values[0].value;
    document.getElementById('annContr_simple401').value = $values[1].value;
    $('#simpleModal').toggle();
  });

  // IRA Modal Components
  window.iraCalc = () => {
    let roth = parseInt(document.getElementById('annContr_rothIra').value) || 0;
    let trad = parseInt(document.getElementById('annContr_tradIra').value) || 0;
    let total = roth + trad;  
    let $values = $('#iraModal .iraContAmount');
    let range = document.getElementsByClassName('tab')[currentTab];
    let effects = range.querySelectorAll("[id^='annContr']");
    if (total > 6000) {
      effects.forEach(a => {
        a.classList.add('invalid');
      });
      $values[0].value = trad;
      $values[1].value = roth;
      iraModalTotal();
      effects.forEach(a => {
        a.classList.remove('invalid');
      });
      $('#iraModal').toggle();
    } else if (total <= 6000) {
      effects.forEach(a => {
        a.classList.remove('invalid');
      });
    }
  };
  
  window.iraModalTotal = (e) => {
    let iraContAmount = 0;
    $('.iraContAmount').each(function() {
      if ($(this).val()) {
        iraContAmount += parseInt($(this).val());
      }
    });
    $('.iraTotal').text(dollarFormat.format(iraContAmount));
    if (iraContAmount > 6000) {
      $('.iraTotal').css('color','red');
      $('#iraModalClose').prop('disabled',true);
    } else {
      $('.iraTotal').css('color','black');
      $('#iraModalClose').prop('disabled',false);
    }
  }  

  $('#iraModalClose').click(()=>{
    let $values = $('#iraModal .iraContAmount');
    document.getElementById('annContr_tradIra').value = $values[0].value;
    document.getElementById('annContr_rothIra').value = $values[1].value;
    $('#iraModal').toggle();
  });

  // Calculators
  // Calc for multiplying monthly value by 12
  window.monthlyCalc = (e) => {
    e.parentNode.lastChild.value = parseInt(e.value * 12);
    e.parentNode.lastChild.classList.remove('invalid');
  }
  
  // Calc to determine how much money needed in retirement
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

  // var toggle = document.getElementById('retSalCalcClose');
  // var toggle2 = document.getElementById('calculator');
  // var $slider = $('#retSalCalc');
  // console.log($slider[0].classList);

  // toggle.addEventListener('click', function() {
  //   console.log('triggered button');
  //   var isOpen = $slider[0].classList.contains('slide-in');
  //   console.log(isOpen);
  //   $($slider).attr('class', isOpen ? 'slide-out' : 'slide-in');
  //   $('#retSalCalc').toggle();
  // });
  // toggle2.addEventListener('click', function() {
  //   console.log('triggered icon');
  //   var isOpen = $slider[0].classList.contains('slide-in');
  //   console.log(isOpen);
  //   $($slider).attr('class', isOpen ? 'slide-out' : 'slide-in');
  //   $('#retSalCalc').toggle();
  // });

});