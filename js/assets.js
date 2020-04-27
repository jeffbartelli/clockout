import {data} from './survey.js';
import {life, retire, growthRate} from './data.js';

document.addEventListener('DOMContentLoaded', function() {

});

window.calcAge = () => {
  let b = data.demographics.dob.split(/\D/);
  let c = new Date(b[0], --b[1], b[2]);
  let age = new Date(Date.now() - c).getFullYear()-1970;
  let byear = c.getFullYear();
  let gender;
  let le;
  if(data.demographics.hasOwnProperty('gender')) {
    gender = data.demographics['gender'];
  }
  if(life.hasOwnProperty(byear)) {
    gender == 'male' ? le = life[byear][0] + life.stdev[0] : le = life[byear][1] + life.stdev[1];
  };
  return {
    currentYr: new Date().getFullYear(),
    age: age,
    retire: parseInt(data.demographics.retAge),
    death: le
  };
}

/* Puts ages and dates into the retire variable */
window.dates = () => {
  let ages = calcAge();
  let cycle = ages.death - ages.age;
  for (let i=0;i<cycle+1;i++) {
    retire.dates.year.push(ages.currentYr+i);
    retire.dates.age.push(ages.age+i);
  }
}

/* Enters the target salary into the retire variable */
window.targetSal = () => {
  let ages = calcAge();
  let cycle = ages.death - ages.age;
  let amount = data.demographics.retSal;
  for (let i=0;i<cycle+1;i++) {
    retire.totals.target.push(
      amount = amount * (1+growthRate.inflation) 
    );
  };
  console.log(retire);
}

window.ssi = () => {
  let ages = calcAge();
  const birthYear = ages.current - ages.age;
  const deathYear = ages.current - ages.age + ages.death;
  let ssiCola = 0.0215;
  let ssiPayout = [];
  let ssiRate = 0;
  let annualRate = 0;
  let retYear = parseInt(birthYear) + parseInt(data.ssi.retirementAgeSsi);
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
  let ssiRate = 0;
  let annualRate = 0;
  let retYear = parseInt(birthYear) + parseInt(data.fersPension.benBeginAgeFers);
  if(data.fersPension.active == true) { /* this if should be outside the function */
    switch (parseInt(data.fersPension.benBeginAgeFers)) { 
      case 57: ssiRate = 0.75; break;
      case 58: ssiRate = 0.80; break;
      case 59: ssiRate = 0.85; break;
      case 60: ssiRate = 0.90; break;
      case 61: ssiRate = 0.95; break;
      case 62: ssiRate = 1.00; 
    };
    annualRate = parseInt(data.fersPension.annualBenAmtFers) * ssiRate;
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

window.tradIra = () => {
  let ages = calcAge();
  const birthYear = ages.current - ages.age;
  const deathYear = ages.current - ages.age + ages.death;
  const endContYear = birthYear + parseInt(data.tradIra.contEndAgeTradIra);
  let tradIraPayout = [];
  if (data.tradIra.active == true) {
    for (let i=ages.current; i<deathYear+1; i++) {
      /* For each year, first increase current value by investStrat %, then add on contribution amount. If current age over 50 && catchUpContTradIra is checked then add extra $1k. Then push total for that year. InvestStrat percentage should decrease based on ages.retire. Also try to structure the output to help guide later changes to the data?  */
    }
  }

}

