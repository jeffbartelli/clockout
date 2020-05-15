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
  var retCount = () => {
    let count = 0;
    for (let j=(ages.retire - ages.age); j<(59 - ages.age); j++) {
      if (retire.totals.remaining[j] == 0) {
        count++;
      }
    }
    return count;
  };
  for (let i=0;i<ages.cycle;i++) {
    retire.dates.year.push(ages.currentYr+i);
    retire.dates.age.push(ages.age+i);
    if (i <= ages.retire - ages.age) {
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
  /* 1. If Account == Active */
  if(data.tradAccts.active == true) {
    /* 2. Create records in retire object */
    retire.ecaAccts.tradAccts = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentValTrad = data.tradAccts.currentValTrad;
    var empContTrad = parseFloat(data.tradAccts.empContTrad) || 0;
    var annualContTrad = parseFloat(data.tradAccts.annualContTrad) || 0;
    var contEndAgeTrad = data.tradAccts.contEndAgeTrad;
    var catchUpContTrad = data.tradAccts.catchUpContTrad;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.ecaAccts.tradAccts.beginValue.push(currentValTrad);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentValTrad == 0) {
        /* 6. If age threshold */
        if (i >= (70 - ages.age)) {
          /* 7. RMD Distribution */
          var rmdTrad = currentValTrad / rmd[ages.age + i];
          /* 8. Push RMD Value */
          currentValTrad -= rmdTrad;
          retire.totals.remaining[i] -= rmdTrad;
          retire.ecaAccts.tradAccts.rmd.push(rmdTrad);
          /* 9. Retire.[...].Remaining <0 Test */
          //retire.totals.remaining[i] < 0 ? true : false;
          /* 10. Apply 50% Growth Rate to RMD amount */
          currentValTrad += (rmdTrad/2.4 * (investGrowth(i)-1));
        } else {
          retire.ecaAccts.tradAccts.rmd.push(0);
        }
        /* 11. Apply Growth Rate */
        currentValTrad *= investGrowth(i);
      } else {
        retire.ecaAccts.tradAccts.rmd.push(0);
      }
      /* 12. Accrue Personal/Employer Contributions */
      if (i <= (contEndAgeTrad - ages.age)) {
        currentValTrad += (empContTrad + annualContTrad);
        /* 13. Apply 50% Growth Rate to Personal/Employer Contributions */
        currentValTrad += ((empContTrad + annualContTrad)/2.4 * (investGrowth(i)-1));
        /* 14. Accrue Catch Up Contributions */
        if ((catchUpContTrad == true) && (i >= (55 - ages.age))) {
          currentValTrad += 6500;
          /* 15. Apply 50% Growth Rate to Catch Up Contributions */
          currentValTrad += (6500/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 16. Push End Value */
      retire.ecaAccts.tradAccts.endValue.push(currentValTrad);
    }
  }
  // SIMPLE IRA
  /* 1. If Account == Active */
  if(data.simpleIra.active == true) {
    /* 2. Create records in retire object */
    retire.ecaAccts.simpleIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentValSimpleIra = data.simpleIra.currentValSimpleIra;
    var empContSimpleIra = parseFloat(data.simpleIra.empContSimpleIra) || 0;
    var annualContSimpleIra = parseFloat(data.simpleIra.annualContSimpleIra) || 0;
    var contEndAgeSimpleIra = data.simpleIra.contEndAgeSimpleIra;
    var catchUpContSimpleIra = data.simpleIra.catchUpContSimpleIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.ecaAccts.simpleIra.beginValue.push(currentValSimpleIra);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentValSimpleIra == 0) {
        /* 6. If age threshold */
        if (i >= (70 - ages.age)) {
          /* 7. RMD Distribution */
          var rmdSimpleIra = currentValSimpleIra / rmd[ages.age + i];
          /* 8. Push RMD Value */
          currentValSimpleIra -= rmdSimpleIra;
          retire.totals.remaining[i] -= rmdSimpleIra;
          retire.ecaAccts.simpleIra.rmd.push(rmdSimpleIra);
          /* 9. Apply 50% Growth Rate to RMD amount */
          currentValSimpleIra += (rmdSimpleIra/2.4 * (investGrowth(i)-1));
          /* 10. Retire.[...].Remaining <0 Test */
          //retire.totals.remaining[i] < 0 ? true : false;
        } else {
          retire.ecaAccts.simpleIra.rmd.push(0);
        }
        /* 11. Apply Growth Rate */
        currentValSimpleIra *= investGrowth(i);
      } else {
        retire.ecaAccts.simpleIra.rmd.push(0);
      }
      /* 12. Accrue Personal/Employer Contributions */
      if (i <= (contEndAgeSimpleIra - ages.age)) {
        currentValSimpleIra += (empContSimpleIra + annualContSimpleIra);
        /* 13. Apply 50% Growth Rate to Personal/Employer Contributions */
        currentValSimpleIra += ((empContSimpleIra + annualContSimpleIra)/2.4 * (investGrowth(i)-1));
        /* 14. Accrue Catch Up Contributions */
        if ((catchUpContSimpleIra == true) && (i >= (55 - ages.age))) {
          currentValSimpleIra += 3000;
          /* 15. Apply 50% Growth Rate to Catch Up Contributions */
          currentValSimpleIra += (3000/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 16. Push End Value */
      retire.ecaAccts.simpleIra.endValue.push(currentValSimpleIra);
    }
  }

  // SIMPLE 401k
  /* 1. If Account == Active */
  if(data.simple401.active == true) {
    /* 2. Create records in retire object */
    retire.ecaAccts.simple401 = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentValSimple401 = data.simple401.currentValSimple401;
    var empContSimple401 = parseFloat(data.simple401.empContSimple401) || 0;
    var annualContSimple401 = parseFloat(data.simple401.annualContSimple401) || 0;
    var contEndAgeSimple401 = data.simple401.contEndAgeSimple401;
    var catchUpContSimple401 = data.simple401.catchUpContSimple401;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.ecaAccts.simple401.beginValue.push(currentValSimple401);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentValSimple401 == 0) {  
      /* 6. If age threshold */
      if (i >= (70 - ages.age)) {
        /* 7. RMD Distribution */
        var rmdSimple401 = currentValSimple401 / rmd[ages.age + i];
        /* 8. Push RMD Value */
        currentValSimple401 -= rmdSimple401;
        retire.totals.remaining[i] -= rmdSimple401;
        retire.ecaAccts.simple401.rmd.push(rmdSimple401);
        /* 9. Apply 50% Growth Rate to RMD amount */
        currentValSimple401 += (rmdSimple401/2.4 * (investGrowth(i)-1));
        /* 10. Retire.[...].Remaining <0 Test */
        //retire.totals.remaining[i] < 0 ? true : false;
      } else {
        retire.ecaAccts.simple401.rmd.push(0);
      }
      /* 11. Apply Growth Rate */
      currentValSimple401 *= investGrowth(i);
    } else {
      retire.ecaAccts.simple401.rmd.push(0);
    }
      /* 12. Accrue Personal/Employer Contributions */
      if (i <= (contEndAgeSimple401 - ages.age)) {
        currentValSimple401 += (empContSimple401 + annualContSimple401);
        /* 13. Apply 50% Growth Rate to Personal/Employer Contributions */
        currentValSimple401 += ((empContSimple401 + annualContSimple401)/2.4 * (investGrowth(i)-1));
        /* 14. Accrue Catch Up Contributions */
        if ((catchUpContSimple401 == true) && (i >= (55 - ages.age))) {
          currentValSimple401 += 3000;
          /* 15. Apply 50% Growth Rate to Catch Up Contributions */
          currentValSimple401 += (3000/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 16. Push End Value */
      retire.ecaAccts.simple401.endValue.push(currentValSimple401);
    }
  }

  retire.iraAccts = {};
  // TRAD IRA
  /* 1. If Account == Active */
  if(data.tradIra.active == true) {
    /* 2. Create records in retire object */
    retire.iraAccts.tradIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentValTradIra = data.tradIra.currentValTradIra;
    var contEndAgeTradIra = data.tradIra.contEndAgeTradIra;
    var annualContTradIra = parseFloat(data.tradIra.annualContTradIra) || 0;
    var catchUpContTradIra = data.tradIra.catchUpContTradIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.iraAccts.tradIra.beginValue.push(currentValTradIra);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentValTradIra == 0) {
        /* 6. If age threshold */
        if (i >= (70 - ages.age)) {
          /* 7. RMD Distribution */
          var rmdTradIra = currentValTradIra / rmd[ages.age + i];
          /* 8. Push RMD Value */
          currentValTradIra -= rmdTradIra;
          retire.totals.remaining[i] -= rmdTradIra;
          retire.iraAccts.tradIra.rmd.push(rmdTradIra);
          /* 9. Apply 50% Growth Rate to RMD amount */
          currentValTradIra += (rmdTradIra/2.4 * (investGrowth(i)-1));
          /* 10. Retire.[...].Remaining <0 Test */
          //retire.totals.remaining[i] < 0 ? true : false;
        } else {
          retire.iraAccts.tradIra.rmd.push(0);
        }
        /* 11. Apply Growth Rate */
        currentValTradIra *= investGrowth(i);
      } else {
        retire.iraAccts.tradIra.rmd.push(0);
      }
      /* 12. Accrue Personal Contributions */
      if (i <= (contEndAgeTradIra - ages.age)) {
        currentValTradIra += annualContTradIra;
        /* 13. Apply 50% Growth Rate to Personal Contributions */
        currentValTradIra += (annualContTradIra/2.4 * (investGrowth(i)-1));
        /* 14. Accrue Catch Up Contributions */
        if ((catchUpContTradIra == true) && (i >= (55 - ages.age))) {
          currentValTradIra += 1000;
          /* 15. Apply 50% Growth Rate to Catch Up Contributions */
          currentValTradIra += (1000/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 16. Push End Value */
      retire.iraAccts.tradIra.endValue.push(currentValTradIra);
    }
  }

  retire.invAccts = {};
  // INVESTMENT ACCOUNTS
  /* 1. If Account == Active */
  if(data.investAcct.active == true) {
    /* 2. Create records in retire object */
    retire.invAccts.investAcct = {beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentValInv = data.investAcct.currentValInv;
    var contEndAgeInv = data.investAcct.contEndAgeInv;
    var annualContInv = data.investAcct.annualContInv;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.invAccts.investAcct.beginValue.push(currentValInv);
      /* 5. Determine and Set Withdrawal Amount */
      if (retire.totals.remaining[i] > 0) {
        if (currentValInv >= retire.totals.remaining[i]) {
          retire.invAccts.investAcct.withdrawal.push(retire.totals.remaining[i]);
        } else {
          retire.invAccts.investAcct.withdrawal.push(currentValInv);
        }
      } else {
        retire.invAccts.investAcct.withdrawal.push(0);
      }
      currentValInv -= retire.invAccts.investAcct.withdrawal[i];
      retire.totals.remaining[i] -= retire.invAccts.investAcct.withdrawal[i];
      /* 6. Prevent interest accrual once current value = 0 */
      if (!currentValInv == 0) {
        /* 7. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentValInv += (retire.invAccts.investAcct.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 8. Apply Growth Rate */
        currentValInv *= investGrowth(i);
      }
      /* 9. Accrue Contributions */
      if (i <= (contEndAgeInv - ages.age)) {
        currentValInv += annualContInv;
        /* 10. Apply (5/12)% Growth Rate to Contributions */
        currentValInv += (annualContInv/2.4 * (investGrowth(i)-1));
      }
      /* 11. Push End Value */
      retire.invAccts.investAcct.endValue.push(currentValInv);      
    }
  }
  // ROTH ECA ACCOUNTS
  /* 1. If Account == Active */
  if(data.rothAccts.active == true) {
    /* 2. Create records in retire object */
    retire.ecaAccts.rothAccts = {contributions: [], beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var amtContRoth = data.rothAccts.amtContRoth;
    var currentValRoth = data.rothAccts.currentValRoth;
    var empContRoth = parseFloat(data.rothAccts.empContRoth) || 0;
    var annualContRoth = parseFloat(data.rothAccts.annualContRoth) || 0;
    var contEndAgeRoth = data.rothAccts.contEndAgeRoth;
    var catchUpContRoth = data.rothAccts.catchUpContRoth;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value for Total and Contributions */
      retire.ecaAccts.rothAccts.beginValue.push(currentValRoth);
      /* 5. Determine Withdrawal Amount */
      if (retire.totals.remaining[i] > 0) {
        /* 6. Age threshold: Withdraw against contributions before age 59 */
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (amtContRoth/((59 - ages.retire) - retCount()) < retire.totals.remaining[i]) {
            retire.ecaAccts.rothAccts.withdrawal.push(amtContRoth/((59 - ages.retire) - retCount()));
          } else {
            retire.ecaAccts.rothAccts.withdrawal.push(retire.totals.remaining[i]);
          };
          /* 7. Deduct withdrawal from total contributions */
          if (amtContRoth > retire.ecaAccts.rothAccts.withdrawal[i]) {
            amtContRoth -= retire.ecaAccts.rothAccts.withdrawal[i];
          } else {
            amtContRoth = 0;
          }
        } else if (i >= (59 - ages.age)) {
          /* 8. Age threshold: Withdraw against balance after age 59 */
          if (currentValRoth >= retire.totals.remaining[i]) {
            retire.ecaAccts.rothAccts.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.ecaAccts.rothAccts.withdrawal.push(currentValRoth);
          }
        }
      } else {
        retire.ecaAccts.rothAccts.withdrawal.push(0);
      }
      /* 9. Deduct withdrawal from current value and from retire...remaining */
      currentValRoth -= retire.ecaAccts.rothAccts.withdrawal[i];
      retire.totals.remaining[i] -= retire.ecaAccts.rothAccts.withdrawal[i];
      /* 10. Prevent interest accrual once current value = 0 */
      if (!currentValRoth == 0) {
        /* 11. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentValRoth += (retire.ecaAccts.rothAccts.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 12. Apply Growth Rate */
        currentValRoth *= investGrowth(i);
      }
      /* 13. Accrue Contributions */
      if (i <= (contEndAgeRoth - ages.age)) {
        currentValRoth += (annualContRoth + empContRoth);
        amtContRoth += annualContRoth;
        /* 14. Apply (5/12)% Growth Rate to Contributions */
        currentValRoth += ((annualContRoth + empContRoth)/2.4 * (investGrowth(i)-1));
        /* 15. Accrue Catch Up Contributions */
        if ((catchUpContRoth == true) && (i >= (55 - ages.age))) {
          currentValRoth += 6500;
          amtContRoth += 6500;
          /* 16. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentValRoth += (6500/2.4 * (investGrowth(i)-1));
        };
      };
      /* 17. Push End Value */
      retire.ecaAccts.rothAccts.endValue.push(currentValRoth);
      if (amtContRoth > retire.ecaAccts.rothAccts.endValue[i]) {
        retire.ecaAccts.rothAccts.contributions.push(retire.ecaAccts.rothAccts.endValue[i]);
      } else {
        retire.ecaAccts.rothAccts.contributions.push(amtContRoth);
      }
    }
  }
  // ROTH IRA
    /* 1. If Account == Active */
  if(data.rothIra.active == true) {
    /* 2. Create records in retire object */
    retire.iraAccts.rothIra = {contributions: [], beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var amtContRothIra = data.rothIra.amtContRothIra;
    var currentValRothIra = data.rothIra.currentValRothIra;
    var annualContRothIra = data.rothIra.annualContRothIra;
    var catchUpContRothIra = data.rothIra.catchUpContRothIra;
    var contEndAgeRothIra = data.rothIra.contEndAgeRothIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value for Total and Contributions */
      retire.iraAccts.rothIra.beginValue.push(currentValRothIra);
      /* 5. Determine Withdrawal Amount */
      if (retire.totals.remaining[i] > 0) {
        /* 6. Age threshold: Withdraw against contributions before age 59 */
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (amtContRothIra/((59 - ages.retire) - retCount()) < retire.totals.remaining[i]) {
            retire.iraAccts.rothIra.withdrawal.push(amtContRothIra/((59 - ages.retire) - retCount()));
          } else {
            retire.iraAccts.rothIra.withdrawal.push(retire.totals.remaining[i]);
          };
          /* 7. Deduct withdrawal from total contributions */
          if (amtContRothIra > retire.iraAccts.rothIra.withdrawal[i]) {
            amtContRothIra -= retire.iraAccts.rothIra.withdrawal[i];
          } else {
            amtContRothIra = 0;
          }
        } else if (i >= (59 - ages.age)) {
          /* 8. Age threshold: Withdraw against balance after age 59 */
          if (currentValRothIra >= retire.totals.remaining[i]) {
            retire.iraAccts.rothIra.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.iraAccts.rothIra.withdrawal.push(currentValRothIra);
          }
        }
      } else {
        retire.iraAccts.rothIra.withdrawal.push(0);
      }
      /* 9. Deduct withdrawal from current value and from retire...remaining */
      currentValRothIra -= retire.iraAccts.rothIra.withdrawal[i];
      retire.totals.remaining[i] -= retire.iraAccts.rothIra.withdrawal[i];
      /* 10. Prevent interest accrual once current value = 0 */
      if (!currentValRothIra == 0) {
        /* 11. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentValRothIra += (retire.iraAccts.rothIra.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 12. Apply Growth Rate */
        currentValRothIra *= investGrowth(i);
      }
      /* 13. Accrue Contributions */
      if (i <= (contEndAgeRothIra - ages.age)) {
        currentValRothIra += annualContRothIra;
        amtContRothIra += annualContRothIra;
        /* 14. Apply (5/12)% Growth Rate to Contributions */
        currentValRothIra += (annualContRothIra/2.4 * (investGrowth(i)-1));
        /* 15. Accrue Catch Up Contributions */
        if ((catchUpContRothIra == true) && (i >= (55 - ages.age))) {
          currentValRothIra += 1000;
          amtContRothIra += 1000;
          /* 16. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentValRothIra += (1000/2.4 * (investGrowth(i)-1));
        };
      };
      /* 17. Push End Value */
      retire.iraAccts.rothIra.endValue.push(currentValRothIra);
      if (amtContRothIra > retire.iraAccts.rothIra.endValue[i]) {
        retire.iraAccts.rothIra.contributions.push(retire.iraAccts.rothIra.endValue[i]);
      } else {
        retire.iraAccts.rothIra.contributions.push(amtContRothIra);
      }
    }
  }
  /* 17. If Account == Active */
  if(data.tradAccts.active == true) {
    for (let i=0; i<ages.cycle; i++) {
      /* 18. Test Acct & Remaining > 0; Age Threshold */
      if (retire.totals.remaining[i] > 0
        && retire.ecaAccts.tradAccts.endValue[i] > 0
        && i >= 59 - ages.age) {
          /* 19. Push Withdrawal Value */
        if (retire.ecaAccts.tradAccts.endValue[i] >= retire.totals.remaining[i]) {
          retire.ecaAccts.tradAccts.withdrawal.push(retire.totals.remaining[i]);
        } else {
          retire.ecaAccts.tradAccts.withdrawal.push(retire.ecaAccts.tradAccts.endValue[i]);
        }
        retire.ecaAccts.tradAccts.endValue[i] -= retire.ecaAccts.tradAccts.withdrawal[i];
        retire.totals.remaining[i] -= retire.ecaAccts.tradAccts.withdrawal[i];
      } else {
        retire.ecaAccts.tradAccts.withdrawal.push(0);
      }
    
    }
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