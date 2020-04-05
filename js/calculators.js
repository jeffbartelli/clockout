import {currentTab, data} from './survey.js';
import {dollarFormat} from './numberFormats.js';

document.addEventListener('DOMContentLoaded', function() {

  window.ecaCalc = (e) => {
    $(e).addClass('thisCalc');
    e.parentNode.lastChild.innerHTML = dollarFormat.format(data.demographics.salary);
    document.getElementById(e.parentNode.htmlFor).value = parseInt(Math.round(data.demographics.salary * (e.value/100) > 57000 ? 57000 : data.demographics.salary * (e.value/100)));
    $(e).removeClass('thisCalc');
      // Need a separate calculator or logic for Roth accounts.
  }
  
  window.ecaModal = () => {
    let $accounts = $('legend');
    for (let i=7; i<17; i++) {
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
      $(this).text(dollarFormat.format(data.demographics.salary));
    });  
  }
  ecaModal();
  
  window.ecaModalCalc = (e) => {
    $(e).parent().last().find('.modalSalary').text(dollarFormat.format(data.demographics.salary));
    $(e).parent().next().find('.ecaContAmount').val(parseInt(Math.round(data.demographics.salary * (e.value/100) > 19500 ? 19500 : data.demographics.salary * (e.value/100))));
    ecaModalTotal();
  };

  window.ecaModalTotal = () => {
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
    document.getElementById('annualContTrad401').value = $values[0].value;
    document.getElementById('annualContRoth401').value = $values[1].value;
    document.getElementById('annualContSafeHarbor401').value = $values[2].value;
    document.getElementById('annualContSingle401').value = $values[3].value;
    document.getElementById('annualContTrad403').value = $values[4].value;
    document.getElementById('annualContRoth403').value = $values[5].value;
    document.getElementById('annualContTrad457').value = $values[6].value;
    document.getElementById('annualContRoth457').value = $values[7].value;
    document.getElementById('annualContSimpleIra').value = $values[8].value;
    document.getElementById('annualContSimple401').value = $values[9].value;
    $('#ecaModal').toggle();
  });
  
  window.monthlyCalc = (e) => {
    e.parentNode.lastChild.value = parseInt(e.value * 12);
  }
  
  window.iraCalc = (e) => {
    let rothValue = +parseInt(document.getElementById('annualContRothIra').value) || 0;
    let tradValue = +parseInt(document.getElementById('annualContTradIra')) || 0;
    let roth = document.getElementById('annualContRothIra');
    let trad = document.getElementById('annualContTradIra');
    let total = rothValue + tradValue;
    if (total > 6000) {
      roth.classList.add('invalid');
      trad.classList.add('invalid');
      alert(`Total combined annual contributions to Roth and Traditional IRAs cannot exceed $6,000. Your total is currently ${dollarFormat.format(total)}.`);
    } else if (total <= 6000) {
      $(roth).removeClass('invalid');
      $(trad).removeClass('invalid');
    }
  }
  
  window.simpleCalc = (e) => {
    let rothValue = +parseInt(document.getElementById('annualContSimpleIra').value) || 0;
    let tradValue = +parseInt(document.getElementById('annualContSimple401').value) || 0;
    let roth = document.getElementById('annualContSimpleIra');
    let trad = document.getElementById('annualContSimple401');
    let total = rothValue + tradValue;
    if (total > 13500) {
      roth.classList.add('invalid');
      trad.classList.add('invalid');
      alert(`Total combined annual contributions to Simple IRA and Simple 401k cannot exceed $13,500. Your total is currently ${dollarFormat.format(total)}. Remember, this total is included in the larger Employer Contribution Accounts (401k, 403b, 457b, Simple) contribution limits.`);
    } else if (total <= 13500) {
      $(roth).removeClass('invalid');
      $(trad).removeClass('invalid');
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
    let $values = $('#ecaModal .ecaContAmount');
    let range = document.getElementsByClassName('tab')[currentTab];
    let effects = range.querySelectorAll("[id^='annualCont']");
    if (total > 19500) {
      effects.forEach(a => {
        a.classList.add('invalid');
      });
      $values[0].value = trad401;
      $values[1].value = roth401;
      $values[2].value = safe401;
      $values[3].value = single401;
      $values[4].value = trad403;
      $values[5].value = roth403;
      $values[6].value = trad457;
      $values[7].value = roth457;
      $values[8].value = simpleIra;
      $values[9].value = simple401;
      ecaModalTotal();
      $('#ecaModal').toggle();
    } else if (total <= 19500) {
      effects.forEach(a => {
        $(a).removeClass('invalid');
      })
    }
  };
  
});