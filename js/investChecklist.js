  /* Creates list of investments on survey.html */
  var investmentSelect = () => {
    var incomeTitles = ['Social Security Retirement Benefits','Enter Your Pension(s) Here','Federal Employees Enter Their FERS Details Here','Enter Annuity or Insurance Details Here','Enter VA Disability Details Here','Enter Social Security Disability Details Here','Enter Other Sources of Disability Benefits Here','Enter Estimated Annual Income From Job(s) You Plan to Work in Retirement Here','Enter Annual Rental Profits Here','Enter Any Other Income or Benefits Here'];
    var investTitles = ['Enter Your Traditional IRA Information Here','Enter Your Roth IRA Information Here','Enter Information on Traditional 401k, 403b, 457, TSP, Safe Harbor 401k, and Single 401k Accounts Here','Enter Information on Roth 401k, 403b, 457, and TSP Accounts Here','Enter Simple IRA Details Here','Enter Simple 401k Details Here','Enter Information On All Non-Tax-Advantaged Accounts Here','Enter Information On All Other Income Generating Assets Here'];
    let $accounts = $('h4.income');
    $('.investmentSelect').append(
      $('<div/>').attr('class','incomeList').append(
        $('<h4/>').text('Income & Benefits:')
      )
    );
    for (let i=0; i<$accounts.length; i++) {
      $('.incomeList').append(
        $('<p/>').append(
          $('<label/>')
            .text($accounts[i].innerHTML)
            .attr('data-title',incomeTitles[i])
            .attr('class','accountItems') 
            .prepend(
              $('<input/>')
                .attr('type','checkbox')
                .addClass('accountTypes')
    )))};
    $('.investmentSelect').find('*').filter(':input:first').prop('checked','true')
    // .prop('disabled','true')
    ;
    $('.investmentSelect').append(
      $('<div/>').attr('class','investList').append(
        $('<h4/>').text('Investment Accounts:')
      )
    );
    let $investments = $('h4.investment');
    for (let i=0; i<$investments.length; i++) {
      $('.investList').append(
        $('<p/>').append(
          $('<label/>')
            .text($investments[i].innerHTML)
            .attr('data-title',investTitles[i])
            .attr('class','accountItems')
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

export {investmentSelect};