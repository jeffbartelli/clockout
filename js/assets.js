import {data} from './survey.js';
import {life, growthRate, rmd} from './data.js';

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
  let investGrowth = (i) => {return i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500}
  var retire = {};
  retire.dates = {year: [], age: []};
  retire.totals = {required: [], income: [], remaining: [], taxes: []};
  let targetSalAmt = parseInt(data.demographics.retSal);
  for (let i=0;i<ages.cycle;i++) {
    retire.dates.year.push(ages.currentYr+i);
    retire.dates.age.push(ages.age+i);
    if (i < ages.retire - ages.age) {
      retire.totals.income.push(0);
      retire.totals.taxes.push(0);
      retire.totals.required.push(0);
      retire.totals.remaining.push(0);
    } else {
      retire.totals.income.push(targetSalAmt);
      retire.totals.taxes.push(targetSalAmt*0.2);
      retire.totals.required.push(targetSalAmt*1.2);
      retire.totals.remaining.push(targetSalAmt*1.2);
    }
    targetSalAmt *= 1+growthRate.inflation 
  };
  retire.income = {};
  // SOCIAL SECURITY
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
        retire.totals.remaining[i] -= ssiAmount;
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
    let penAmount = data.genPension.annualBenAmtGen;
    let penBeginAge = data.genPension.benBeginAgeGen;
    let penCola = data.genPension.annualColaGen/100;
    let penColaAge = data.genPension.colaBeginAgeGen;
    for (let i=0; i<ages.cycle; i++) {
      if (i < (penBeginAge - ages.age)) {
        retire.income.genPension.annual.push(0);
      } else {
        retire.income.genPension.annual.push(penAmount);
        retire.totals.remaining[i] -= penAmount;
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
    switch (fersBeginAge) { 
      case 57: fersRate = 0.75; break;
      case 58: fersRate = 0.80; break;
      case 59: fersRate = 0.85; break;
      case 60: fersRate = 0.90; break;
      case 61: fersRate = 0.95; break;
      case 62: fersRate = 1.00; 
    };
    let fersAmount = data.fersPension.annualBenAmtFers * fersRate;
    for (let i=0; i<ages.cycle; i++) {
      if (i < fersBeginAge - ages.age) {
        retire.income.fersPension.annual.push(0);
      } else {
        retire.income.fersPension.annual.push(fersAmount);
        retire.totals.remaining[i] -= fersAmount;
        fersAmount *= 1+growthRate.fers;
      }
    }
  };
  // ANNUITIES/INSURANCE
  if(data.annuities.active == true) {
    retire.income.annuities = {annual: []};
    let annAmount = data.annuities.annualAnnuity;
    let annuityCola = data.annuities.annuityCola/100;
    let annuityAge = data.annuities.annuityAge;
    for (let i=0; i<ages.cycle; i++) {
      if (i < annuityAge - ages.age) {
        retire.income.annuities.annual.push(0);
      } else {
        retire.income.annuities.annual.push(annAmount);
        retire.totals.remaining[i] -= annAmount;
        annAmount *= 1+annuityCola;
      }
    }
  };
  // VA DISABILITY
  if(data.vaDisability.active == true) {
    retire.income.vaDisability = {annual: []};
    let vaAmount = data.vaDisability.annualAmtVa;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.vaDisability.annual.push(0);
      } else {
        retire.income.vaDisability.annual.push(vaAmount);
        retire.totals.remaining[i] -= vaAmount;
      }
      vaAmount *= 1+growthRate.vaDisability;
    }
  };
  // SSI DISABILITY
  if(data.ssiDisability.active == true) {
    retire.income.ssiDisability = {annual: []};
    let ssiDisAmount = data.ssiDisability.annualAmtSsi;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.ssiDisability.annual.push(0);
      } else {
        retire.income.ssiDisability.annual.push(ssiDisAmount);
        retire.totals.remaining[i] -= ssiDisAmount;
      }
      ssiDisAmount *=1+growthRate.ssi;
    }
  };
  // OTHER DISABILITY
  if(data.otherDisability.active == true) {
    retire.income.otherDisability = {annual: []};
    let oDisAmount = data.otherDisability.annualAmtOther;
    let disCola = data.otherDisability.colaOther/100;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.otherDisability.annual.push(0);
      } else {
        retire.income.otherDisability.annual.push(oDisAmount);
        retire.totals.remaining[i] -= oDisAmount;
      }
      oDisAmount *=1+disCola;
    }
  };
  // RETIREMENT SALARY
  if(data.retireSal.active == true) {
    retire.income.retireSal = {annual: []};
    let retSalAmount = data.retireSal.retSalAmt;
    for (let i=0; i<ages.cycle; i++) {
      if (i < data.retireSal.retSalBeginAge - ages.age) {
        retire.income.retireSal.annual.push(0);
      } else if (i < data.retireSal.retSalEndAge - ages.age) {
        retire.income.retireSal.annual.push(retSalAmount);
        retire.totals.remaining[i] -= retSalAmount;
      } else {
        retire.income.retireSal.annual.push(0);
      }
      retSalAmount *=1+growthRate.inflation;
    }
  };
  // RENTS
  if(data.rents.active == true) {
    retire.income.rents = {annual: []};
    let rentAmount = data.rents.rentalProfits;
    let growth = data.rents.rentalProfitsGrowth/100;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.rents.annual.push(0);
      } else {
        retire.income.rents.annual.push(rentAmount);
        retire.totals.remaining[i] -= rentAmount;
      }
      rentAmount *=1+growth;
    }
  };
  // OTHER BENEFITS
  if(data.otherBen.active == true) {
    retire.income.otherBen = {annual: []};
    let oBenAmount = data.otherBen.otherBenAmt;
    let oBenCola = data.otherBen.otherBenCola/100;
    let oBenAge = data.otherBen.otherBenBeginAge;
    for (let i=0; i<ages.cycle; i++) {
      if (i < oBenAge - ages.age) {
        retire.income.otherBen.annual.push(0);
      } else {
        retire.income.otherBen.annual.push(oBenAmount);
        retire.totals.remaining[i] -= oBenAmount;
      }
      oBenAmount *= 1+oBenCola;
    }
  };
  retire.ecaAccts = {};
  // TRADITIONAL ACCOUNTS
  if(data.tradAccts.active == true) {
    retire.ecaAccts.tradAccts = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    var currentValTrad = data.tradAccts.currentValTrad;
    var empContTrad = data.tradAccts.empContTrad;
    var contEndAgeTrad = data.tradAccts.contEndAgeTrad;
    var annualContTrad = data.tradAccts.annualContTrad;
    var catchUpContTrad = data.tradAccts.catchUpContTrad;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.tradAccts.beginValue.push(currentValTrad *= investGrowth(i));
      if (i >= (70 - ages.age)) {
        var rmdTrad = currentValTrad / rmd[ages.age + i];
        currentValTrad -= rmdTrad;
        retire.totals.remaining[i] -= rmdTrad;
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
    var currentValSimpleIra = data.simpleIra.currentValSimpleIra;
    var empContSimpleIra = data.simpleIra.empContSimpleIra;
    var contEndAgeSimpleIra = data.simpleIra.contEndAgeSimpleIra;
    var annualContSimpleIra = data.simpleIra.annualContSimpleIra;
    var catchUpContSimpleIra = data.simpleIra.catchUpContSimpleIra;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.simpleIra.beginValue.push(currentValSimpleIra *= investGrowth(i));
      if (i >= (70 - ages.age)) {
        var rmdSimpleIra = currentValSimpleIra / rmd[ages.age + i];
        currentValSimpleIra -= rmdSimpleIra;
        retire.totals.remaining[i] -= rmdSimpleIra;
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
    var currentValSimple401 = data.simple401.currentValSimple401;
    var empContSimple401 = data.simple401.empContSimple401;
    var contEndAgeSimple401 = data.simple401.contEndAgeSimple401;
    var annualContSimple401 = data.simple401.annualContSimple401;
    var catchUpContSimple401 = data.simple401.catchUpContSimple401;
    for (let i=0; i<ages.cycle; i++) {
      retire.ecaAccts.simple401.beginValue.push(currentValSimple401 *= investGrowth(i));
      if (i >= (70 - ages.age)) {
        var rmdSimple401 = currentValSimple401 / rmd[ages.age + i];
        currentValSimple401 -= rmdSimple401;
        retire.totals.remaining[i] -= rmdSimple401;
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
    var currentValTradIra = data.tradIra.currentValTradIra;
    var contEndAgeTradIra = data.tradIra.contEndAgeTradIra;
    var annualContTradIra = data.tradIra.annualContTradIra;
    var catchUpContTradIra = data.tradIra.catchUpContTradIra;
    for (let i=0; i<ages.cycle; i++) {
      retire.iraAccts.tradIra.beginValue.push(currentValTradIra *= investGrowth(i)) 
      if (i >= (70 - ages.age)) {
        var rmdTradIra = currentValTradIra / rmd[ages.age + i];
        currentValTradIra -= rmdTradIra;
        retire.totals.remaining[i] -= rmdTradIra;
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

  retire.invAccts = {};
  // INVESTMENT ACCOUNTS
  if(data.investAcct.active == true) {
    retire.invAccts.investAcct = {beginValue: [], withdrawal: [], endValue: []};
    var currentValInv = data.investAcct.currentValInv;
    var contEndAgeInv = data.investAcct.contEndAgeInv;
    var annualContInv = data.investAcct.annualContInv;
    for (let i=0; i<ages.cycle; i++) {
      currentValInv *= investGrowth(i);
      if (i <= (contEndAgeInv - ages.age)) {
        currentValInv += annualContInv;
      }
      retire.invAccts.investAcct.beginValue.push(currentValInv);
      if (retire.totals.remaining[i] > 0) {
        if (currentValInv >= retire.totals.remaining[i]) {
          retire.invAccts.investAcct.withdrawal.push(retire.totals.remaining[i]);
        } else {
          retire.invAccts.investAcct.withdrawal.push(currentValInv);
        }
      } else {
        retire.invAccts.investAcct.withdrawal.push(0);
      }
      retire.totals.remaining[i] -= retire.invAccts.investAcct.withdrawal[i];
      retire.invAccts.investAcct.endValue.push(retire.invAccts.investAcct.beginValue[i] - retire.invAccts.investAcct.withdrawal[i]);
      currentValInv = retire.invAccts.investAcct.endValue[i];
    }
  }
  // OTHER ASSETS
  // if(data.otherAssets.active == true) {
  //   retire.invAccts.otherAssets = {beginValue: [], withdrawal: [], endValue: []};
  // }  
  // ROTH ECA ACCOUNTS
  if(data.rothAccts.active == true) {
    retire.ecaAccts.rothAccts = {contributions: [], beginValue: [], withdrawal: [], endValue: []};
    var amtContRoth = data.rothAccts.amtContRoth;
    var currentValRoth = data.rothAccts.currentValRoth;
    var empContRoth = parseInt(data.rothAccts.empContRoth) || 0;
    var contEndAgeRoth = data.rothAccts.contEndAgeRoth;
    var annualContRoth = data.rothAccts.annualContRoth;
    var catchUpContRoth = data.rothAccts.catchUpContRoth;
    for (let i=0; i<ages.cycle; i++) {
      // Annual growth applied
      currentValRoth *= investGrowth(i);
      // Annual contribution applied
      if (i <= (contEndAgeRoth - ages.age)) {
        currentValRoth += annualContRoth;
        currentValRoth += empContRoth;
        if ((catchUpContRoth == true) && (i > (55 - ages.age))) {
          currentValRoth += 6500;
          amtContRoth += 6500;
        }
        amtContRoth += annualContRoth;
      }
      // Applied beginning value
      retire.ecaAccts.rothAccts.beginValue.push(currentValRoth);
      retire.ecaAccts.rothAccts.contributions.push(amtContRoth);
      // Counter function for zero balances in remaining between retire age and 59
      var retCount = () => {
        let count = 0;
        for (let j=(ages.retire - ages.age); j<(59 - ages.age); j++) {
          if (retire.totals.remaining[j] == 0) {
            count++;
          }
        }
        return count;
      };      
      // Determine Withdrawal Amount
      if (retire.totals.remaining[i] > 0) {
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (amtContRoth/((59 - ages.retire) - retCount()) < retire.totals.remaining[i]) {
            retire.ecaAccts.rothAccts.withdrawal.push(amtContRoth/((59 - ages.retire) - retCount()));
          } else {
            retire.ecaAccts.rothAccts.withdrawal.push(retire.totals.remaining[i]);
          }
        } else if (i >= (59 - ages.age)) {
          if (currentValRoth >= retire.totals.remaining[i]) {
            retire.ecaAccts.rothAccts.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.ecaAccts.rothAccts.withdrawal.push(currentValRoth);
          }
        }
      } else {
        retire.ecaAccts.rothAccts.withdrawal.push(0);
      }
      // Subtract withdrawal to get end value
      retire.totals.remaining[i] -= retire.ecaAccts.rothAccts.withdrawal[i];
      retire.ecaAccts.rothAccts.endValue.push(retire.ecaAccts.rothAccts.beginValue[i] - retire.ecaAccts.rothAccts.withdrawal[i]);
      if (retire.ecaAccts.rothAccts.contributions[i] > retire.ecaAccts.rothAccts.withdrawal[i]) {
        retire.ecaAccts.rothAccts.contributions[i] -= retire.ecaAccts.rothAccts.withdrawal[i];
      } else {
        retire.ecaAccts.rothAccts.contributions[i] = 0;
      }
      currentValRoth = retire.ecaAccts.rothAccts.endValue[i];
      amtContRoth = retire.ecaAccts.rothAccts.contributions[i];
    }
  }
  // ROTH IRA
  if(data.rothIra.active == true) {
    retire.iraAccts.rothIra = {contributions: [], beginValue: [], withdrawal: [], endValue: []};
    var amtContRothIra = data.rothIra.amtContRothIra;
    var currentValRothIra = data.rothIra.currentValRothIra;
    var annualContRothIra = data.rothIra.annualContRothIra;
    var catchUpContRothIra = data.rothIra.catchUpContRothIra;
    var contEndAgeRothIra = data.rothIra.contEndAgeRothIra;
    for (let i=0; i<ages.cycle; i++) {
      // Annual growth applied
      currentValRothIra *= investGrowth(i);
      // Annual contribution applied
      if (i <= (contEndAgeRothIra - ages.age)) {
        currentValRothIra += annualContRothIra;
        if ((catchUpContRothIra == true) && (i > (55 - ages.age))) {
          currentValRothIra += 1000;
          amtContRothIra += 1000;
        }
        amtContRothIra += annualContRothIra;
      }
      // Applied beginning value
      retire.iraAccts.rothIra.beginValue.push(currentValRothIra);
      retire.iraAccts.rothIra.contributions.push(amtContRothIra);
      // Counter function for zero balances in remaining between retire age and 59
      var retCount = () => {
        let count = 0;
        for (let j=(ages.retire - ages.age); j<(59 - ages.age); j++) {
          if (retire.totals.remaining[j] == 0) {
            count++;
          }
        }
        return count;
      }; 
      // Determine Withdrawal Amount
      if (retire.totals.remaining[i] > 0) {
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (amtContRothIra/((59 - ages.retire) - retCount()) < retire.totals.remaining[i]) {
            retire.iraAccts.rothIra.withdrawal.push(amtContRothIra/((59 - ages.retire) - retCount()));
          } else {
            retire.iraAccts.rothIra.withdrawal.push(retire.totals.remaining[i]);
          }
        } else if (i >= (59 - ages.age)) {
          if (currentValRothIra >= retire.totals.remaining[i]) {
            retire.iraAccts.rothIra.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.iraAccts.rothIra.withdrawal.push(currentValRothIra);
          }
        }
      } else {
        retire.iraAccts.rothIra.withdrawal.push(0);
      }
      // Subtract withdrawal to get end value
      retire.totals.remaining[i] -= retire.iraAccts.rothIra.withdrawal[i];
      retire.iraAccts.rothIra.endValue.push(retire.iraAccts.rothIra.beginValue[i] - retire.iraAccts.rothIra.withdrawal[i]);
      if (retire.iraAccts.rothIra.contributions[i] > retire.iraAccts.rothIra.withdrawal[i]) {
        retire.iraAccts.rothIra.contributions[i] -= retire.iraAccts.rothIra.withdrawal[i];
      } else {
        retire.iraAccts.rothIra.contributions[i] = 0;
      }
      currentValRothIra = retire.iraAccts.rothIra.endValue[i];
      amtContRothIra = retire.iraAccts.rothIra.contributions[i];
    }
  }
  if(data.tradAccts.active == true) {
    // EACH OF THESE NEEDS THE BASIC WITHDRAWAL CODE FOR 70 AND OVER. CLOSE EACH IF WITH CODE ASSIGNING END VALUE TO THE NEXT BEGIN VALUE (SEE LINES ABOVE).
  }
  if(data.simpleIra.active == true) {
  
  }
  if(data.simple401.active == true) {
  
  }
  if(data.tradIra.active == true) {

  }
  console.log(retire);
};

// export {income};