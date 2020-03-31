// import {currentTab} from './survey.js';

$(document).ready(function(){

  let dollarFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  window.ecaCalc = (e) => {
    $(e).addClass('thisCalc');
    e.parentNode.lastChild.innerHTML = dollarFormat.format(data.salary);
    document.getElementById(e.parentNode.htmlFor).value = parseInt(Math.round(data.salary * (e.value/100) > 57000 ? 57000 : data.salary * (e.value/100)));
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
            <input type="number" class="ecaContAmount" placeholder="0">\
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
      $(this).text(dollarFormat.format(data.salary));
    });  
  }
  ecaModal();
  
  window.ecaModalCalc = (e) => {
    $(e).parent().last().find('.modalSalary').text(dollarFormat.format(data.salary));
    $(e).parent().next().find('.ecaContAmount').val(parseInt(Math.round(data.salary * (e.value/100) > 19500 ? 19500 : data.salary * (e.value/100))));
  
    let ecaContAmount = 0;
    $('.ecaContAmount').each(function(e) {
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
  }
  
  window.monthlyCalc = (e) => {
    e.parentNode.lastChild.value = parseInt(e.value * 12);
  }
  
  window.iraCalc = (e) => {
    let roth = +parseInt(document.getElementById('annualContRothIra').value) || 0;
    let trad = +parseInt(document.getElementById('annualContTradIra')) || 0;
    let total = roth + trad;
    if (total > 6000) {
      roth.className += " invalid";
      trad.className += " invalid";
      alert(`Total combined annual contributions to Roth and Traditional IRAs cannot exceed $6,000. Your total is currently ${dollarFormat.format(total)}.`);
    } else if (total <= 6000) {
      roth.className = '';
      trad.className = '';
    }
  }
  
  window.simpleCalc = (e) => {
    let roth = +parseInt(document.getElementById('annualContSimpleIra').value) || 0;
    let trad = +parseInt(document.getElementById('annualContSimple401').value) || 0;
    let total = roth + trad;
    if (total > 13500) {
      roth.className += " invalid";
      trad.className += " invalid";
      alert(`Total combined annual contributions to Simple IRA and Simple 401k cannot exceed $13,500. Your total is currently ${dollarFormat.format(total)}. Remember, this total is included in the larger Employer Contribution Accounts (401k, 403b, 457b, Simple) contribution limits.`);
    } else if (total <= 13500) {
      roth.className = '';
      trad.className = '';
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
    let range = document.getElementsByClassName('tab')[currentTab];
    // CURRENT TAB UNDEFINED. DEFINED IN SURVEY.JS. HOW TO GET IT OVER HERE? MODULES DIDN'T WORK.
    let effects = range.querySelectorAll("[id^='annualCont']");
    if (total > 19500) {
      effects.forEach(a => {
        a.className += " invalid";
      })
      alert(`Total combined annual contributions cannot exceed $19,500. This total is comprised of all 401k, 403b, 457b, and Simple accounts you maintain. Your current projected annual contributions are as follows: \n Traditional 401k: ${dollarFormat.format(trad401)} \n Roth 401k: ${dollarFormat.format(roth401)} \n Single 401k: ${dollarFormat.format(single401)} \n Safe Harbor 401k: ${dollarFormat.format(safe401)} \n Traditional 403b: ${dollarFormat.format(trad403)} \n Roth 403b: ${dollarFormat.format(roth403)} \n Traditional 457: ${dollarFormat.format(trad457)} \n Roth 457: ${dollarFormat.format(roth457)} \n Simple IRA: ${dollarFormat.format(simpleIra)} \n Simple 401k: ${dollarFormat.format(simple401)} \n Total: ${dollarFormat.format(total)}\nPlease reduce these values to less than $19,501.`);
    } else if (total <= 19500) {
      effects.forEach(a => {
        a.className = '';
      })
    }
  }
  
});