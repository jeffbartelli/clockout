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
    death: le,
    cycle: le - age
  };
}

window.dates = () => {
  retire.dates = {year: [], age: []};
  let ages = calcAge();
  for (let i=0;i<ages.cycle+1;i++) {
    retire.dates.year.push(ages.currentYr+i);
    retire.dates.age.push(ages.age+i);
  }
}

window.targetSal = () => {
  retire.totals = {target: [], subtotal: [], taxes: []};
  let ages = calcAge();
  let amount = data.demographics.retSal;
  for (let i=0;i<ages.cycle+1;i++) {
    if (i < ages.retire - ages.age) {
      retire.totals.target.push(0);
    } else {
      retire.totals.target.push(amount);
    }
    amount *= 1+growthRate.inflation 
  };
}

window.ssi = () => {
  if(data.ssi.active == true) {
    retire.income.ssi = {annual: []};
    let ages = calcAge();
    let fersRate = 0;
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
    let benAmount = parseInt(data.ssi.monthlyAmtSsi) * fersRate;
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < (data.ssi.retirementAgeSsi - ages.age)) {
        retire.income.ssi.annual.push(0);
      } else {
        retire.income.ssi.annual.push(benAmount);
      }
      if (ages.currentYr + i == 2035) {
        benAmount *= 0.76;
      }
      benAmount *= 1+growthRate.ssi;
    };
  };
}

window.genPension = () => {
  if(data.genPension.active == true) {
    retire.income.genPension = {annual: []};
    let ages = calcAge();
    let penAmount = parseInt(data.genPension.annualBenAmtGen);
    let penBeginAge = parseInt(data.genPension.benBeginAgeGen);
    let penCola = parseInt(data.genPension.annualColaGen)/100;
    let penColaAge = parseInt(data.genPension.colaBeginAgeGen);
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < (penBeginAge - ages.age)) {
        retire.income.genPension.annual.push(0);
      } else {
        retire.income.genPension.annual.push(penAmount);
      }
      if (i >= (penColaAge - ages.age - 1)) {
        penAmount *= 1+penCola;
      }
    }
  }
}

window.fersPension = () => {
  if(data.fersPension.active == true) {
    retire.income.fersPension = {annual: []};
    let ages = calcAge();
    let benBeginAge = data.fersPension.benBeginAgeFers;
    let fersRate = 0;
    switch (parseInt(benBeginAge)) { 
      case 57: fersRate = 0.75; break;
      case 58: fersRate = 0.80; break;
      case 59: fersRate = 0.85; break;
      case 60: fersRate = 0.90; break;
      case 61: fersRate = 0.95; break;
      case 62: fersRate = 1.00; 
    };
    let benAmount = parseInt(data.fersPension.annualBenAmtFers) * fersRate;
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < benBeginAge - ages.age) {
        retire.income.fersPension.annual.push(0);
      } else {
        retire.income.fersPension.annual.push(benAmount);
        benAmount *= 1+growthRate.fers;
      }
    }
  }
}

window.annuities = () => {
  if(data.annuities.active == true) {
    retire.income.annuities = {annual: []};
    let ages = calcAge();
    let benAmount = parseInt(data.annuities.annualAnnuity);
    let annuityCola = parseInt(data.annuities.annuityCola)/100;
    let annuityAge = parseInt(data.annuities.annuityAge);
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < annuityAge - ages.age) {
        retire.income.annuities.annual.push(0);
      } else {
        retire.income.annuities.annual.push(benAmount);
        benAmount *= 1+annuityCola;
      }
    }
  }
}

window.vaDisability = () => {
  if(data.vaDisability.active == true) {
    retire.income.vaDisability = {annual: []};
    let ages = calcAge();
    let amount = parseInt(data.vaDisability.annualAmtVa);
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.vaDisability.annual.push(0);
      } else {
        retire.income.vaDisability.annual.push(amount);
      }
      amount *= 1+growthRate.vaDisability;
    }
  }
}

window.ssiDisability = () => {
  if(data.ssiDisability.active == true) {
    retire.income.ssiDisability = {annual: []};
    let ages = calcAge();
    let amount = parseInt(data.ssiDisability.annualAmtSsi);
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.ssiDisability.annual.push(0);
      } else {
        retire.income.ssiDisability.annual.push(amount);
      }
      amount *=1+growthRate.ssi;
    }
  }
}

window.otherDisability = () => {
  if(data.otherDisability.active == true) {
    retire.income.otherDisability = {annual: []};
    let ages = calcAge();
    let amount = parseInt(data.otherDisability.annualAmtOther);
    let cola = parseInt(data.otherDisability.colaOther)/100;
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.otherDisability.annual.push(0);
      } else {
        retire.income.otherDisability.annual.push(amount);
      }
      amount *=1+cola;
    }
  }
}

window.retireSal = () => {
  if(data.retireSal.active == true) {
    retire.income.retireSal = {annual: []};
    let ages = calcAge();
    let amount = parseInt(data.retireSal.retSalAmt);
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < data.retireSal.retSalBeginAge - ages.age) {
        retire.income.retireSal.annual.push(0);
      } else if (i < data.retireSal.retSalEndAge - ages.age) {
        retire.income.retireSal.annual.push(amount);
      } else {
        retire.income.retireSal.annual.push(0);
      }
      amount *=1+growthRate.inflation;
    }
  }
}

window.rents = () => {
  if(data.rents.active == true) {
    retire.income.rents = {annual: []};
    let ages = calcAge();
    let amount = parseInt(data.rents.rentalProfits);
    let growth = parseInt(data.rents.rentalProfitsGrowth)/100;
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.rents.annual.push(0);
      } else {
        retire.income.rents.annual.push(amount);
      }
      amount *=1+growth;
    }
  }
}

window.otherBen = () => {
  if(data.otherBen.active == true) {
    retire.income.otherBen= {annual: []};
    let ages = calcAge();
    let benAmount = parseInt(data.otherBen.otherBenAmt);
    let benCola = parseInt(data.otherBen.otherBenCola)/100;
    let benAge = parseInt(data.otherBen.otherBenBeginAge);
    for (let i=0; i<ages.cycle+1; i++) {
      if (i < benAge - ages.age) {
        retire.income.otherBen.annual.push(0);
      } else {
        retire.income.otherBen.annual.push(benAmount);
      }
      benAmount *= 1+benCola;
    }
  }
}

window.tester = () => {
  calcAge();
  targetSal();
  dates();
  retire.income = {};
  ssi();
  genPension();
  fersPension();
  annuities();
  vaDisability();
  ssiDisability();
  otherDisability();
  retireSal();
  rents();
  otherBen();
  console.log(retire);
}