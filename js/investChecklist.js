document.addEventListener('DOMContentLoaded', function() {

  /* Creates list of investments */
  window.investmentSelect = () => {
    let $accounts = $('legend');
    for (let i=1; i<$accounts.length; i++) {
      $('.investmentSelect').append(
        $('<p/>').append(
          $('<label/>')
            .text($accounts[i].innerHTML)
            .prepend(
              $('<input/>')
                .attr('type','checkbox')
                .addClass('accountTypes') 
    )))}
    $('.investmentSelect').find('*').filter(':input:first').prop('checked','true').prop('disabled','true');
    let $accountTypes = $('.accountTypes');
    let $tabs = $('.tab');
    for (let i=1; i<$('.tab').length; i++) {
      $accountTypes[i-1].classList.add($tabs[i].id);
    }
  }
  investmentSelect();

});