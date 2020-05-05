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
  // SOCIAL SECURITY
  if(data.ssi.active == true) {
    retire.income.ssi = {annual: []};
    let ssiRate = 0;
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
  // GENERAL PENSIONS
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
  // FERS PENSION
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
  // ANNUITIES/INSURANCE
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
  // VA DISABILITY
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
  // SSI DISABILITY
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
  // OTHER DISABILITY
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
  // RETIREMENT SALARY
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
  // RENTS
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
  // OTHER BENEFITS
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
  retire.ecaAccts = {};
  // TRADITIONAL ACCOUNTS
  if(data.tradAccts.active == true) {
    retire.ecaAccts.tradAccts = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    let currentValTrad = parseInt(data.tradAccts.currentValTrad) || 0;
    let empContTrad = parseInt(data.tradAccts.empContTrad) || 0;
    let contEndAgeTrad = parseInt(data.tradAccts.contEndAgeTrad) || 0;
    let annualContTrad = parseInt(data.tradAccts.annualContTrad) || 0;
    let catchUpContTrad = data.tradAccts.catchUpContTrad;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.tradAccts.beginValue.push(currentValTrad *= (i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500));
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
  // SIMPLE IRA
  if(data.simpleIra.active == true) {
    retire.ecaAccts.simpleIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    let currentValSimpleIra = parseInt(data.simpleIra.currentValSimpleIra) || 0;
    let empContSimpleIra = parseInt(data.simpleIra.empContSimpleIra) || 0;
    let contEndAgeSimpleIra = parseInt(data.simpleIra.contEndAgeSimpleIra) || 0;
    let annualContSimpleIra = parseInt(data.simpleIra.annualContSimpleIra) || 0;
    let catchUpContSimpleIra = data.simpleIra.catchUpContSimpleIra;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.simpleIra.beginValue.push(currentValSimpleIra *= (i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500));
      if (i >= (70 - ages.age)) {
        var rmdSimpleIra = currentValSimpleIra / parseInt(rmd[ages.age + i]) || 0;
        currentValSimpleIra -= rmdSimpleIra;
        retire.totals.subtotal[i] += rmdSimpleIra;
        retire.ecaAccts.simpleIra.rmd.push(rmdSimpleIra);
      } else {
        retire.ecaAccts.simpleIra.rmd.push(0);
      }
      if (i <= (contEndAgeSimpleIra - ages.age)) {
        currentValSimpleIra += (empContSimpleIra + annualContSimpleIra);
        if ((catchUpContSimpleIra == true) && (i > (55 - ages.age))) {
          currentValSimpleIra += 3000;
        };        
      }
      retire.ecaAccts.simpleIra.endValue.push(currentValSimpleIra);
    }
  }
  // SIMPLE 401k
  if(data.simple401.active == true) {
    retire.ecaAccts.simpleI401 = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    let currentValSimple401 = parseInt(data.simple401.currentValSimple401) || 0;
    let empContSimple401 = parseInt(data.simple401.empContSimple401) || 0;
    let contEndAgeSimple401 = parseInt(data.simple401.contEndAgeSimple401) || 0;
    let annualContSimple401 = parseInt(data.simple401.annualContSimple401) || 0;
    let catchUpContSimple401 = data.simple401.catchUpContSimple401;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.simple401.beginValue.push(currentValSimple401 *= (i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500));
      if (i >= (70 - ages.age)) {
        var rmdSimple401 = currentValSimple401 / parseInt(rmd[ages.age + i]) || 0;
        currentValSimple401 -= rmdSimple401;
        retire.totals.subtotal[i] += rmdSimple401;
        retire.ecaAccts.simple401.rmd.push(rmdSimple401);
      } else {
        retire.ecaAccts.simple401.rmd.push(0);
      }
      if (i <= (contEndAgeSimple401 - ages.age)) {
        currentValSimple401 += (empContSimple401 + annualContSimple401);
        if ((catchUpContSimple401 == true) && (i > (55 - ages.age))) {
          currentValSimple401 += 3000;
        };        
      }
      retire.ecaAccts.simple401.endValue.push(currentValSimple401);
    }
  };
  retire.iraAccts = {};
  // TRAD IRA
  if(data.tradIra.active == true) {
    retire.iraAccts.tradIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    let currentValTradIra = parseInt(data.tradIra.currentValTradIra) || 0;
    let contEndAgeTradIra = parseInt(data.tradIra.contEndAgeTradIra) || 0;
    let annualContTradIra = parseInt(data.tradIra.annualContTradIra) || 0;
    let catchUpContTradIra = data.tradIra.catchUpContTradIra;
    for (let i=0; i<ages.cycle; i++) {
      retire.iraAccts.tradIra.beginValue.push(currentValTradIra *= (i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500));
      if (i >= (70 - ages.age)) {
        var rmdTradIra = currentValTradIra / parseInt(rmd[ages.age + i]) || 0;
        currentValTradIra -= rmdTradIra;
        retire.totals.subtotal[i] += rmdTradIra;
        retire.iraAccts.tradIra.rmd.push(rmdTradIra);
      } else {
        retire.iraAccts.tradIra.rmd.push(0);
      }
      if (i <= (contEndAgeTradIra - ages.age)) {
        currentValTradIra += annualContTradIra;
        if ((catchUpContTradIra == true) && (i > (55 - ages.age))) {
          currentValTradIra += 1000;
        };        
      }
      retire.iraAccts.tradIra.endValue.push(currentValTradIra);
    }
  }

  console.log(retire);
};

// export {income};