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

window.ssi = () => {
  let ages = calcAge();
  const birthYear = ages.current - ages.age;
  const deathYear = ages.current - ages.age + ages.death;
  let ssiCola = 0.0215;
  let ssiPayout = [];
  let fersRate = 0;
  let annualRate = 0;
  let retYear = parseInt(birthYear) + parseInt(data.ssi.retirementAgeSsi);
  if(data.ssi.active == true) { /* this if should be outside the function */
    switch (parseInt(data.ssi.retirementAgeSsi)) { 
      case 62: fersRate = 0.70; break;
      case 63: fersRate = 0.76; break;
      case 64: fersRate = 0.82; break;
      case 65: fersRate = 0.88; break;
      case 66: fersRate = 0.94; break;
      case 67: fersRate = 1.00; break;
      case 68: fersRate = 1.08; break;
      case 69: fersRate = 1.16; break;
      case 70: fersRate = 1.24;
    };
    annualRate = parseInt(data.ssi.monthlyAmtSsi) * fersRate;
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

window.genPension = () => {
  let ages = calcAge();
  const birthYear = ages.current - ages.age;
  const deathYear = ages.current - ages.age + ages.death;
  let retYear = parseInt(birthYear) + parseInt(data.genPension.benBeginAgeGen);
  let genPenPayout = [];
  let genPenCola = parseInt(data.genPension.annualColaGen);
  let genPenColaBegin = parseInt(data.genPension.colaBeginAgeGen);
  let annualRate = parseInt(data.genPension.annualBenAmtGen);
  if(data.genPension.active == true) {
    for (let i=ages.current; i<deathYear; i++) {
      if (i<retYear) {
        genPenPayout.push(0);
      } else {
        genPenPayout.push(annualRate);
        if (i >= birthYear+genPenColaBegin-1) {
          annualRate *= 1+(genPenCola/100);
        }
      }
    }
  }
  return genPenPayout;
}

window.fersPension = () => {
  let ages = calcAge();
  const birthYear = ages.current - ages.age;
  const deathYear = ages.current - ages.age + ages.death;
  let fersCola = 0.0177;
  let fersPayout = [];
  let fersRate = 0;
  let annualRate = 0;
  let retYear = parseInt(birthYear) + parseInt(data.fersPension.benBeginAgeFers);
  if(data.fersPension.active == true) { /* this if should be outside the function */
    switch (parseInt(data.fersPension.benBeginAgeFers)) { 
      case 57: fersRate = 0.75; break;
      case 58: fersRate = 0.80; break;
      case 59: fersRate = 0.85; break;
      case 60: fersRate = 0.90; break;
      case 61: fersRate = 0.95; break;
      case 62: fersRate = 1.00; 
    };
    annualRate = parseInt(data.fersPension.annualBenAmtFers) * fersRate;
    for (let i=ages.current; i<deathYear; i++) {
      if (i<retYear) {
        fersPayout.push(0);
      } else {
        fersPayout.push(annualRate);
        if (i >birthYear+61) {
          annualRate *= 1+fersCola;
        }
      } 
    }
  }
  return fersPayout;
}

window.annuities = () => {
  let ages = calcAge();
  const birthYear = ages.current - ages.age;
  const deathYear = ages.current - ages.age + ages.death;
  let retYear = parseInt(birthYear) + parseInt(data.annuities.annuityAge);
  let annuityPayout = [];
  let annuityCola = parseInt(data.annuities.annuityCola);
  let annualRate = parseInt(data.annuities.annualAnnuity);
  if(data.annuities.active == true) {
    for (let i=ages.current; i<deathYear; i++) {
      if (i<retYear) {
        annuityPayout.push(0);
      } else {
        annuityPayout.push(annualRate);
        annualRate *= 1+(annuityCola/100);
      }
    }
  }
  return annuityPayout;
}