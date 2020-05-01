import {data} from './survey.js';
import {life, retire, growthRate, rmd} from './data.js';

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

window.income = () => {
  let ages = calcAge();
  retire.dates = {year: [], age: []};
  retire.totals = {required: [], income: [], subtotal: [], taxes: []};
  for (let i=0;i<ages.cycle;i++) {
    retire.dates.year.push(ages.currentYr+i);
    retire.dates.age.push(ages.age+i);
    retire.totals.subtotal.push(0);
  }
  let targetSalAmt = data.demographics.retSal;
  for (let i=0;i<ages.cycle;i++) {
    if (i < ages.retire - ages.age) {
      retire.totals.income.push(0);
      retire.totals.taxes.push(0);
      retire.totals.required.push(0);
    } else {
      retire.totals.income.push(targetSalAmt);
      retire.totals.taxes.push(targetSalAmt*0.2);
      retire.totals.required.push(targetSalAmt*1.2);
    }
    targetSalAmt *= 1+growthRate.inflation 
  };
  retire.income = {};
  if(data.ssi.active == true) {
    retire.income.ssi = {annual: []};
    let ssiRate = 0;
    switch (data.ssi.retirementAgeSsi) { 
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
    let ssiAmount = data.ssi.monthlyAmtSsi * ssiRate;
    for (let i=0; i<ages.cycle; i++) {
      if (i < (data.ssi.retirementAgeSsi - ages.age)) {
        retire.income.ssi.annual.push(0);
      } else {
        retire.income.ssi.annual.push(ssiAmount);
        retire.totals.subtotal[i] += ssiAmount;
      }
      if (ages.currentYr + i == 2035) {
        ssiAmount *= 0.76;
      }
      ssiAmount *= 1+growthRate.ssi;
    };
  };
  if(data.genPension.active == true) {
    retire.income.genPension = {annual: []};
    let penAmount = parseInt(data.genPension.annualBenAmtGen);
    let penBeginAge = parseInt(data.genPension.benBeginAgeGen);
    let penCola = parseInt(data.genPension.annualColaGen)/100;
    let penColaAge = parseInt(data.genPension.colaBeginAgeGen);
    for (let i=0; i<ages.cycle; i++) {
      if (i < (penBeginAge - ages.age)) {
        retire.income.genPension.annual.push(0);
      } else {
        retire.income.genPension.annual.push(penAmount);
        retire.totals.subtotal[i] += penAmount;
      }
      if (i >= (penColaAge - ages.age - 1)) {
        penAmount *= 1+penCola;
      }
    }
  };
  if(data.fersPension.active == true) {
    retire.income.fersPension = {annual: []};
    let fersBeginAge = data.fersPension.benBeginAgeFers;
    let fersRate = 0;
    switch (parseInt(fersBeginAge)) { 
      case 57: fersRate = 0.75; break;
      case 58: fersRate = 0.80; break;
      case 59: fersRate = 0.85; break;
      case 60: fersRate = 0.90; break;
      case 61: fersRate = 0.95; break;
      case 62: fersRate = 1.00; 
    };
    let fersAmount = parseInt(data.fersPension.annualBenAmtFers) * fersRate;
    for (let i=0; i<ages.cycle; i++) {
      if (i < fersBeginAge - ages.age) {
        retire.income.fersPension.annual.push(0);
      } else {
        retire.income.fersPension.annual.push(fersAmount);
        retire.totals.subtotal[i] += fersAmount;
        fersAmount *= 1+growthRate.fers;
      }
    }
  };
  if(data.annuities.active == true) {
    retire.income.annuities = {annual: []};
    let annAmount = parseInt(data.annuities.annualAnnuity);
    let annuityCola = parseInt(data.annuities.annuityCola)/100;
    let annuityAge = parseInt(data.annuities.annuityAge);
    for (let i=0; i<ages.cycle; i++) {
      if (i < annuityAge - ages.age) {
        retire.income.annuities.annual.push(0);
      } else {
        retire.income.annuities.annual.push(annAmount);
        retire.totals.subtotal[i] += annAmount;
        annAmount *= 1+annuityCola;
      }
    }
  };
  if(data.vaDisability.active == true) {
    retire.income.vaDisability = {annual: []};
    let vaAmount = parseInt(data.vaDisability.annualAmtVa);
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.vaDisability.annual.push(0);
      } else {
        retire.income.vaDisability.annual.push(vaAmount);
        retire.totals.subtotal[i] += vaAmount;
      }
      vaAmount *= 1+growthRate.vaDisability;
    }
  };
  if(data.ssiDisability.active == true) {
    retire.income.ssiDisability = {annual: []};
    let ssiDisAmount = parseInt(data.ssiDisability.annualAmtSsi);
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.ssiDisability.annual.push(0);
      } else {
        retire.income.ssiDisability.annual.push(ssiDisAmount);
        retire.totals.subtotal[i] += ssiDisAmount;
      }
      ssiDisAmount *=1+growthRate.ssi;
    }
  };
  if(data.otherDisability.active == true) {
    retire.income.otherDisability = {annual: []};
    let oDisAmount = parseInt(data.otherDisability.annualAmtOther);
    let disCola = parseInt(data.otherDisability.colaOther)/100;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.otherDisability.annual.push(0);
      } else {
        retire.income.otherDisability.annual.push(oDisAmount);
        retire.totals.subtotal[i] += oDisAmount;
      }
      oDisAmount *=1+disCola;
    }
  };
  if(data.retireSal.active == true) {
    retire.income.retireSal = {annual: []};
    let retSalAmount = parseInt(data.retireSal.retSalAmt);
    for (let i=0; i<ages.cycle; i++) {
      if (i < data.retireSal.retSalBeginAge - ages.age) {
        retire.income.retireSal.annual.push(0);
      } else if (i < data.retireSal.retSalEndAge - ages.age) {
        retire.income.retireSal.annual.push(retSalAmount);
        retire.totals.subtotal[i] += retSalAmount;
      } else {
        retire.income.retireSal.annual.push(0);
      }
      retSalAmount *=1+growthRate.inflation;
    }
  };
  if(data.rents.active == true) {
    retire.income.rents = {annual: []};
    let rentAmount = parseInt(data.rents.rentalProfits);
    let growth = parseInt(data.rents.rentalProfitsGrowth)/100;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.rents.annual.push(0);
      } else {
        retire.income.rents.annual.push(rentAmount);
        retire.totals.subtotal[i] += rentAmount;
      }
      rentAmount *=1+growth;
    }
  };
  if(data.otherBen.active == true) {
    retire.income.otherBen = {annual: []};
    let oBenAmount = parseInt(data.otherBen.otherBenAmt);
    let oBenCola = parseInt(data.otherBen.otherBenCola)/100;
    let oBenAge = parseInt(data.otherBen.otherBenBeginAge);
    for (let i=0; i<ages.cycle; i++) {
      if (i < oBenAge - ages.age) {
        retire.income.otherBen.annual.push(0);
      } else {
        retire.income.otherBen.annual.push(oBenAmount);
        retire.totals.subtotal[i] += oBenAmount;
      }
      oBenAmount *= 1+oBenCola;
    }
  };
  //POSSIBLE BREAK FOR ecaAccts FROM income
  if(data.tradAccts.active == true) {
    retire.ecaAccts.tradAccts = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    let currentValTrad = parseInt(data.tradAccts.currentValTrad) || 0;
    let empContTrad = parseInt(data.tradAccts.empContTrad) || 0;
    let contEndAgeTrad = parseInt(data.tradAccts.contEndAgeTrad) || 0;
    let annualContTrad = parseInt(data.tradAccts.annualContTrad) || 0;
    let catchUpContTrad = data.tradAccts.catchUpContTrad;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.tradAccts.beginValue.push(currentValTrad *= (1+growthRate.sp500));
      if (i >= (70 - ages.age)) {
        var rmdTrad = currentValTrad / parseInt(rmd[ages.age + i]) || 0;
        currentValTrad -= rmdTrad;
        retire.totals.subtotal[i] += rmdTrad;
        retire.ecaAccts.tradAccts.rmd.push(rmdTrad);
      } else {
        retire.ecaAccts.tradAccts.rmd.push(0);
      }
      if (i <= (contEndAgeTrad - ages.age)) {
        currentValTrad += (empContTrad + annualContTrad);
        if ((catchUpContTrad == true) && (i > (55 - ages.age))) {
          currentValTrad += 6500;
        };        
      }
      retire.ecaAccts.tradAccts.endValue.push(currentValTrad) ;
    }
  }
  console.log(retire);
}