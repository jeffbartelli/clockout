import {data} from './survey.js';
import {life} from './data.js';

document.addEventListener('DOMContentLoaded', function() {

});

window.calcAge = () => {
  let b = data.demographics.dob.split(/\D/);
  let c = new Date(b[0], --b[1], b[2]);
  let age = new Date(Date.now() - c).getFullYear()-1970;
  let byear = c.getFullYear();
  let gender;
  let le;
  if(data.hasOwnProperty('gender')) {
    gender = data['gender'];
  }
  if(life.hasOwnProperty(byear)) {
    gender == 'male' ? le = life[byear][0] + life.stdev[0] : le = life[byear][1] + life.stdev[1];
  };
  return {
    current: new Date().getFullYear(),
    age: age,
    retire: parseInt(data.demographics.retAge),
    death: le
  };
}

/* These need to be at the top of a container for all the account functions */
let ages = calcAge();
const birthYear = ages.current - ages.age;
const deathYear = ages.current - ages.age + ages.death;

window.ssi = () => {
  let ssiCola = 0.0215;
  let ssiPayout = [];
  let ssiRate = 0;
  let annualRate = 0;
  let retYear = birthYear + retirementAgeSsi;
  if(data.ssi.active == true) { /* this if should be outside the function */
    switch (parseInt(data.ssi.retirementAgeSsi)) { 
      case 62: ssiRate = 0.70; break;
      case 63: ssiRate = 0.76; break;
      case 64: ssiRate = 0.82; break;
      case 65: ssiRate = 0.88; break;
      case 66: ssiRate = 0.94; break;
      case 67: ssiRate = 1.00; break;
      case 68: ssiRate = 1.08; break;
      case 69: ssiRate = 1.16; break;
      case 70: ssiRate = 1.24;
    };
    annualRate = parseInt(data.ssi.monthlyAmtSsi) * ssiRate;
    console.log(annualRate);
    console.log(ssiRate);
    for (let i=ages.current; i<deathYear; i++) {
      if (i<retYear) {
        ssiPayout.push(0);
      } else {
        ssiPayout.push(annualRate);
        annualRate *= 1+ssiCola;
      } 
    }
  }
  return ssiPayout;
}
