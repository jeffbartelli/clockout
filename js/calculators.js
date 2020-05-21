import {currentTab, data} from './survey.js';
import {dollarFormat} from './numberFormats.js';

document.addEventListener('DOMContentLoaded', function() {
  const details = demographics();

  window.ecaCalc = (e) => {
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 57000 ? 57000 : details.salary * (e.value/100)));
  }
  
  window.ecaPersCalc = (e) => {
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 19500 ? 19500 : details.salary * (e.value/100)));
    retCalc();
  }

  window.ecaModal = () => {
    let $accounts = $('.sectionHeader');
    for (let i=13; i<17; i++) {
      $('table').append(
        $('<tr/>').append(
          $('<td/>', {'text': $accounts[i].innerHTML})).append(`
          <td>\
            <input type="number" class="percent ecaCalculator" min="0" max="0" placeholder="0.0" onchange="ecaModalCalc(this)">% x\
            <span class="modalSalary"></span> =</td>\
            <td>\
            <input type="number" class="ecaContAmount" 
            onchange="ecaModalCalc(this)"
            placeholder="0">\
            </td>`));   
    }
    $('table').append(
      $('<tr/>').append(
        $('<td/>')
      ).append(
        $('<td/>')
        .text('Total:')
      ).append(
        $('<td/>').append(
          $('<span/>', {'class': 'modalTotal'})
        )
      )
    )
    $('.modalSalary').each(function() {
      $(this).text(dollarFormat.format(details.salary));
    });  
  }
  ecaModal();
  
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
  
  window.monthlyCalc = (e) => {
    e.parentNode.lastChild.value = parseInt(e.value * 12);
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
  
  window.simplePersCalc = (e) => {
    e.nextSibling.nextSibling.innerHTML = dollarFormat.format(details.salary);
    e.parentNode.lastChild.value = parseInt(Math.round(details.salary * (e.value/100) > 13500 ? 13500 : details.salary * (e.value/100)));
    simpleCalc();
  }

  window.simpleCalc = (e) => {
    let rothValue = +parseInt(document.getElementById('annContr_simpleIra').value) || 0;
    let tradValue = +parseInt(document.getElementById('annContr_simple401').value) || 0;
    let roth = document.getElementById('annContr_simpleIra');
    let trad = document.getElementById('annContr_simple401');
    let total = rothValue + tradValue;
    if (total > 13500) {
      roth.classList.add('invalid');
      trad.classList.add('invalid');
      // Build a Simple Modal for managing these inputs
      alert(`Total combined annual contributions to Simple IRA and Simple 401k cannot exceed $13,500. Your total is currently ${dollarFormat.format(total)}. Please adjust these values. And remember, this total is included in the larger Employer Contribution Accounts (401k, 403b, 457b, Simple) contribution limits.`);
    } else if (total <= 13500) {
      roth.classList.remove('invalid');
      trad.classList.remove('invalid');
    }
    retCalc();
  }
  
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