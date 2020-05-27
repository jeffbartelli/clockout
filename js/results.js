
var retire = JSON.parse(localStorage.retireData);
var cycle = localStorage.cycle;
// console.log(retire);

$('#results').append($(`<table class="spreadsheet"/>`));
var keys = Object.keys(retire);

keys.forEach((item) => {
  let subKeys = Object.keys(retire[item]);
  console.log(retire[item]);
  subKeys.forEach((subItem) => {
    console.log(retire[item][subItem]);
    let tubKeys = Object.keys(retire[item][subItem]);
    tubKeys.forEach((tubItem) => {
      console.log(retire[item][subItem][tubItem]);
    });
  });
});

// for (let i=0; i<keys.length; i++) {
//   var subKeys = Object.keys(retire[keys[i]]);
//   $('.spreadsheet').append(`<tr/ class="${keys[i]}" value="${keys[i]}"`);
//   for (let j=0; j<subKeys.length; j++) {
//     console.log(subKeys[j].length);
//     console.log(subKeys[j]);
//     $(`.${keys[i]}`).append(`<td/ class="${subKeys[j]}" value="${subKeys[j]}"`);
//   }
// }




// console.log(keys);