document.addEventListener('DOMContentLoaded', function() {

  var incomeTitles = ['Social Security Retirement Benefits','Enter Your Pension(s) Here','Federal Employees Enter Their FERS Details Here','Enter Annuity or Insurance Details Here','Enter VA Disability Details Here','Enter Social Security Disability Details Here','Enter Other Sources of Disability Benefits Here','Enter Estimated Annual Income From Job(s) You Plan to Work in Retirement Here','Enter Annual Rental Profits Here','Enter Any Other Income or Benefits Here'];
  var investTitles = ['Enter Your Traditional IRA Information Here','Enter Your Roth IRA Information Here','Enter Information on Traditional 401k, 403b, 457, Safe Harbor 401k, and Single 401k Accounts Here','Enter Information on Roth 401k, 403b, and 457 Accounts Here','Enter Simple IRA Details Here','Enter Simple 401k Details Here','Enter Information On All Non-Tax-Advantaged Accounts Here','Enter Information On All Other Income Generating Assets Here'];

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
            .attr('data-title',incomeTitles[i]) 
            .prepend(
              $('<input/>')
                .attr('type','checkbox')
                .addClass('accountTypes')
    )))};
    $('.investmentSelect').find('*').filter(':input:first').prop('checked','true')
    // .prop('disabled','true')
    ;
    $('.investmentSelect').append(
      $('<h4/>').text('Investment Accounts (Mark all that apply);')
    );
    let $investments = $('legend.investment');
    for (let i=0; i<$investments.length; i++) {
      $('.investmentSelect').append(
        $('<p/>').append(
          $('<label/>')
            .text($investments[i].innerHTML)
            .attr('data-title',investTitles[i]) 
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