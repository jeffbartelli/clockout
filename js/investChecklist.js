document.addEventListener('DOMContentLoaded', function() {

  /* Creates list of investments */
  var investmentSelect = () => {
    let $accounts = $('legend.income');
    $('.investmentSelect').append(
      $('<h4/>').text('Income & Benefits (Mark all that apply);')
    );
    for (let i=0; i<$accounts.length; i++) {
      $('.investmentSelect').append(
        $('<p/>').append(
          $('<label/>')
            .text($accounts[i].innerHTML)
            .prepend(
              $('<input/>')
                .attr('type','checkbox')
                .addClass('accountTypes') 
    )))};
    $('.investmentSelect').find('*').filter(':input:first').prop('checked','true').prop('disabled','true');
    $('.investmentSelect').append(
      $('<h4/>').text('Investment Accounts (Mark all that apply);')
    );
    let $investments = $('legend.investment');
    for (let i=0; i<$investments.length; i++) {
      $('.investmentSelect').append(
        $('<p/>').append(
          $('<label/>')
            .text($investments[i].innerHTML)
            .prepend(
              $('<input/>')
                .attr('type','checkbox')
                .addClass('accountTypes') 
    )))};
    let $accountTypes = $('.accountTypes');
    let $tabs = $('.tab');
    for (let i=1; i<$('.tab').length; i++) {
      $accountTypes[i-1].classList.add($tabs[i].id);
    }
  }
  investmentSelect();

});