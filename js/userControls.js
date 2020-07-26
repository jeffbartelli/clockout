window.goBack = () => {
  window.history.back();
}

window.clearValues = () => {
  if (confirm("This will delete all the data you have entered. Are you sure you want to proceed?") == true) {
    localStorage.clear();
    // window.history.back();
    window.location.href = 'survey.html';
  }
}

window.printReport = () => {
  $("#results").show();
  $("#tableView").show();
  window.print();
  $("#tableView").hide();
}

window.reportToggle = () => {
  $("#results").toggle();
  $("#tableView").toggle();
  if ($("#tableView").is(':visible')) {
    document.getElementById('reportToggle').innerHTML = 'Report View';
  } else {
    document.getElementById('reportToggle').innerHTML = 'Table View';
  }
}

$('body').append(`
<div id="emailForm">
  <form action="mailto:jeff.bartelli@zoho.com?subject=ClockOut Error Report" method="POST" enctype="text/plain">
    <fieldset>
      <legend>Personal Information</legend>
      <label for="contactName" id="contactName">Name: <input type="text" id="contactName" name="contactName" placeholder="First & Last Name" maxlength="30" required></label>
    <label for="contactEmail" id="contactEmail">Email Address: <input type="email" name="contactEmail" id="contactEmail" placeholder="you@host.com" required></label>
    </fieldset>
    <fieldset>
      <legend>Description</legend>
      <label for="description" id="contactDesc"><textarea name="description" id="contactDesc" cols="63" rows="10" placeholder="Describe the problem here..." required></textarea></label>
      <input type="hidden" id="warning" name="Do Not Delete Anything Below This Line">
      <input type="hidden" id="demographicData" name="demographicData">
    </fieldset>
    <input type="button" value="Cancel" id="contactCancel">
    <input type="submit" value="Submit" id="contactSubmit">
  </form>
</div>
`);

$('#contactCancel').click(()=>{
  $('#emailForm').toggle();
});

$('#contactSubmit').click(()=>{
  if ($('#contactName').val() && $('#contactEmail').val() && $('#contactDesc').val()) {
    $('#emailForm').toggle();
  }
});

window.sendEmail = () => {
  // window.open(`mailto:jeff.bartelli@zoho.com?subject=I'm Having Troubles with ClockOut&body=Here's a description of the problems I'm having...`);
  $('#emailForm').toggle();
  $('#demographicData').val(JSON.stringify(localStorage.formData));
}