//PersCalc
//retCalc
//ModalTotal

window.iraCalc = (e) => {
  let rothValue = document.getElementById('annContr_rothIra').value;
  console.log(rothValue);
  let tradValue = document.getElementById('annContr_tradIra').value;
  console.log(tradValue);
  let roth = document.getElementById('annContr_rothIra');
  let trad = document.getElementById('annContr_tradIra');
  let total = parseInt(rothValue) + parseInt(tradValue);
  let $values = $('#iraModal .iraContAmount');
  let range = document.getElementsByClassName('tab')[currentTab];
  let effects = range.querySelectorAll("[id^='annContr']");
  if (total > 6000) {
    effects.forEach(a => {
      a.classList.add('invalid');
    });
    $values[0].value = tradValue;
    $values[1].value = rothValue;
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
}

window.iraModalCalc = (e) => {
  parseInt(e.value) > 6000 ? 6000 : parseInt(e.value);
  iraModalTotal();
}

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