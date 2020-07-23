import {harvest} from './survey.js';
import {life, growthRate, rmd} from './data.js';
// import {results} from './results.js';

var calcAge = () => {
  let data = harvest();
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
  if (typeof(Storage) !== "undefined") {
    localStorage.cycle = le - age;
    localStorage.age = age;
    localStorage.retAge = parseInt(data.demographics.retAge);
  }
  return {
    currentYr: new Date().getFullYear(),
    age: age,
    retire: parseInt(data.demographics.retAge),
    death: le,
    cycle: le - age
  };
}

var income = () => {
  localStorage.removeItem('retireData');
  let ages = calcAge();
  let data = harvest();
  let investGrowth = (i) => {return i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500};
  var retire = {};
  retire.years = {time: {}};
  retire.years.time = {year: [], age: []};
  retire.totals = {subTotals: {}};
  retire.totals.subTotals = {required: [], wages: [], remaining: [], taxes: []};
  let targetSalAmt = parseInt(data.demographics.retSal);
  var retCount = () => {
    let count = 0;
    for (let j=(ages.retire - ages.age); j<(59 - ages.age); j++) {if (retire.totals.subTotals.remaining[j] == 0) {count++;}}
    return count;
  };
  for (let i=0;i<ages.cycle;i++) {
    retire.years.time.year.push(ages.currentYr+i);
    retire.years.time.age.push(ages.age+i);
    retire.totals.subTotals.wages.push(+(targetSalAmt).toFixed(2));
    retire.totals.subTotals.taxes.push(+(targetSalAmt*0.2).toFixed(2));
    retire.totals.subTotals.required.push(+(targetSalAmt*1.2).toFixed(2));
    retire.totals.subTotals.remaining.push(+(targetSalAmt*1.2).toFixed(2));
    targetSalAmt *= 1+growthRate.inflation; 
  };

  let portFlag = 0;
  let zeroFlag = 0;
  let ssiFlag = 0;
  let loopFlag = 0;

    // CATEGORY BUILDER
  if (data.socialSecurity || data.genPension || data.fersPension || data.annuities || data.vaDisability || data.ssiDisability || data.otherDisability || data.retireSal || data.rents || data.otherBen) retire.income = {};
  if (data.tradAccts || data.simpleIra || data.simple401 || data.tradIra) retire.tradAccts = {};
  if (data.rothAccts || data.rothIra) retire.rothAccts = {};
  if(data.investmentAcct || data.saveAcct) retire.invAccts = {};

  let ssiAge;
   data.socialSecurity == undefined ? ssiAge = null : ssiAge = data.socialSecurity.beginAge_ssi;

  let portfolio = (retireAge,ssiRetireAge) => {
    // RESET THE REMAINING VARIABLE 
    retire.totals.subTotals.remaining.splice(0,ages.cycle);
    let targetSalAmtDupe = parseInt(data.demographics.retSal);
    for (let i=0;i<ages.cycle;i++) {
      retire.totals.subTotals.remaining.push(+(targetSalAmtDupe*1.2).toFixed(2));
      targetSalAmtDupe *= 1+growthRate.inflation; 
    }
    // SCENARIO TESTING AGE ADJUSTMENTS
    if (retireAge !== undefined) {ages.retire = retireAge;}
    if (ssiRetireAge !== undefined) {ssiAge = ssiRetireAge;}

  // SOCIAL SECURITY
  if(data.socialSecurity) {
    retire.income.socialSecurity = {annual: []};
    let ssiRate = 0;
    switch (ssiAge) { 
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
    let ssiAmount = data.socialSecurity.annAmt_ssi * ssiRate;
    for (let i=0; i<ages.cycle; i++) {
      if (i < (ssiAge - ages.age)) {
        retire.income.socialSecurity.annual.push(0);
      } else {
        retire.income.socialSecurity.annual.push(ssiAmount);
        retire.totals.subTotals.remaining[i] -= ssiAmount;
      }
      if (ages.currentYr + i == 2035) {
        ssiAmount *= 0.76;
      }
      ssiAmount *= 1+growthRate.ssi;
    };
  };
  // GENERAL PENSIONS
  if(data.genPension) {
    retire.income.genPension = {annual: []};
    let penAmount = data.genPension.annAmt_genPension;
    let penBeginAge = data.genPension.beginAge_genPension;
    let penCola = data.genPension.colaRate_genPension/100;
    let penColaAge = data.genPension.colaAge_genPension;
    for (let i=0; i<ages.cycle; i++) {
      if (i < (penBeginAge - ages.age)) {
        retire.income.genPension.annual.push(0);
      } else {
        retire.income.genPension.annual.push(penAmount);
        retire.totals.subTotals.remaining[i] -= penAmount;
      }
      if (i >= (penColaAge - ages.age - 1)) {
        penAmount *= 1+penCola;
      }
    }
  };
  // FERS PENSION
  if(data.fersPension) {
    retire.income.fersPension = {annual: []};
    let fersBeginAge = data.fersPension.beginAge_fersPension;
    let fersRate = 0;
    switch (fersBeginAge) { 
      case 57: fersRate = 0.75; break;
      case 58: fersRate = 0.80; break;
      case 59: fersRate = 0.85; break;
      case 60: fersRate = 0.90; break;
      case 61: fersRate = 0.95; break;
      case 62: fersRate = 1.00; 
    };
    let fersAmount = data.fersPension.annAmt_fersPension * fersRate;
    for (let i=0; i<ages.cycle; i++) {
      if (i < fersBeginAge - ages.age) {
        retire.income.fersPension.annual.push(0);
      } else {
        retire.income.fersPension.annual.push(fersAmount);
        retire.totals.subTotals.remaining[i] -= fersAmount;
        fersAmount *= 1+growthRate.fers;
      }
    }
  };
  // ANNUITIES/INSURANCE
  if(data.annuities) {
    retire.income.annuities = {annual: []};
    let annAmount = data.annuities.annAmt_annuities;
    let colaRate_annuities = data.annuities.colaRate_annuities/100;
    let beginAge_annuities = data.annuities.beginAge_annuities;
    for (let i=0; i<ages.cycle; i++) {
      if (i < beginAge_annuities - ages.age) {
        retire.income.annuities.annual.push(0);
      } else {
        retire.income.annuities.annual.push(annAmount);
        retire.totals.subTotals.remaining[i] -= annAmount;
        annAmount *= 1+colaRate_annuities;
      }
    }
  };
  // VA DISABILITY
  if(data.vaDisability) {
    retire.income.vaDisability = {annual: []};
    let vaAmount = data.vaDisability.annAmt_vaDisability;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.vaDisability.annual.push(0);
      } else {
        retire.income.vaDisability.annual.push(vaAmount);
        retire.totals.subTotals.remaining[i] -= vaAmount;
      }
      vaAmount *= 1+growthRate.vaDisability;
    }
  };
  // SSI DISABILITY
  if(data.ssiDisability) {
    retire.income.ssiDisability = {annual: []};
    let ssiDisAmount = data.ssiDisability.annAmt_ssiDisability;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.ssiDisability.annual.push(0);
      } else {
        retire.income.ssiDisability.annual.push(ssiDisAmount);
        retire.totals.subTotals.remaining[i] -= ssiDisAmount;
      }
      ssiDisAmount *=1+growthRate.ssi;
    }
  };
  // OTHER DISABILITY
  if(data.otherDisability) {
    retire.income.otherDisability = {annual: []};
    let oDisAmount = data.otherDisability.annAmt_otherDisability;
    let disCola = data.otherDisability.colaRate_otherDisability/100;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.otherDisability.annual.push(0);
      } else {
        retire.income.otherDisability.annual.push(oDisAmount);
        retire.totals.subTotals.remaining[i] -= oDisAmount;
      }
      oDisAmount *=1+disCola;
    }
  };
  // RETIREMENT SALARY
  if(data.retireSal) {
    retire.income.retireSal = {annual: []};
    let retSalAmount = data.retireSal.annAmt_retireSal;
    let retSalBeginAge = (data.retireSal.beginAge_retireSal < ages.retire && ages.retire <= data.retireSal.endAge_retireSal) ? ages.retire : (ages.retire > data.retireSal.endAge_retireSal) ? data.retireSal.endAge_retireSal : data.retireSal.beginAge_retireSal;
    for (let i=0; i<ages.cycle; i++) {
      if (i < retSalBeginAge - ages.age) {
        retire.income.retireSal.annual.push(0);
      } else if (i < data.retireSal.endAge_retireSal - ages.age) {
        retire.income.retireSal.annual.push(retSalAmount);
        retire.totals.subTotals.remaining[i] -= retSalAmount;
      } else {
        retire.income.retireSal.annual.push(0);
      }
      retSalAmount *=1+growthRate.inflation;
    }
  };
  // RENTS
  if(data.rents) {
    retire.income.rents = {annual: []};
    let rentAmount = data.rents.annAmt_rents;
    let growth = data.rents.colaRate_rents/100;
    for (let i=0; i<ages.cycle; i++) {
      if (i < ages.retire - ages.age) {
        retire.income.rents.annual.push(0);
      } else {
        retire.income.rents.annual.push(rentAmount);
        retire.totals.subTotals.remaining[i] -= rentAmount;
      }
      rentAmount *=1+growth;
    }
  };
  // OTHER BENEFITS
  if(data.otherBen) {
    retire.income.otherBen = {annual: []};
    let oBenAmount = data.otherBen.annAmt_otherBen;
    let oBenCola = data.otherBen.colaRate_otherBen/100;
    let oBenAge = data.otherBen.otherBenBeginAge;
    for (let i=0; i<ages.cycle; i++) {
      if (i < oBenAge - ages.age) {
        retire.income.otherBen.annual.push(0);
      } else {
        retire.income.otherBen.annual.push(oBenAmount);
        retire.totals.subTotals.remaining[i] -= oBenAmount;
      }
      oBenAmount *= 1+oBenCola;
    }
  };
  // SAVINGS/MONEY MARKET ACCOUNTS
  /* 1. If Account == Active */
  if (data.saveAcct) {
    /* 2. Create records in retire object */
    retire.invAccts.saveAcct = {beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_saveAcct = parseInt(data.saveAcct.currentVal_saveAcct) || 0;
    var annContr_saveAcct = parseInt(data.saveAcct.annContr_saveAcct) || 0;
    var annIntRate_saveAcct = data.saveAcct.annIntRate_saveAcct;
    var endAgeContr_saveAcct = (data.saveAcct.endAgeContr_saveAcct > ages.retire) ? ages.retire : data.saveAcct.endAgeContr_saveAcct;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Check Retirement Age */
      if (i < (ages.retire - ages.age)) {
        /* 5. Push Begin Value */
        retire.invAccts.saveAcct.beginValue.push(currentVal_saveAcct);
        retire.invAccts.saveAcct.withdrawal.push(0);
      } else {
        retire.invAccts.saveAcct.beginValue.push(currentVal_saveAcct);
        /* 6. Determine and Set Withdrawal Amount */
        if (retire.totals.subTotals.remaining[i] > 0) {
          if (currentVal_saveAcct >= retire.totals.subTotals.remaining[i]) {
            retire.invAccts.saveAcct.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.invAccts.saveAcct.withdrawal.push(currentVal_saveAcct);
          }
        } else {
          retire.invAccts.saveAcct.withdrawal.push(0);
        }
      }
      currentVal_saveAcct -= retire.invAccts.saveAcct.withdrawal[i];
      retire.totals.subTotals.remaining[i] -= retire.invAccts.saveAcct.withdrawal[i];
      /* 7. Prevent interest accrual once current value = 0 */
      if (!currentVal_saveAcct == 0) {
        /* 8. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_saveAcct += (retire.invAccts.saveAcct.withdrawal[i]/2.4 * (annIntRate_saveAcct/100));
        /* 9. Apply Growth Rate */
        currentVal_saveAcct *= 1 + (annIntRate_saveAcct/100);
      }
      /* 10. Accrue Contributions */
      if (i <= (endAgeContr_saveAcct - ages.age)) {
        currentVal_saveAcct += annContr_saveAcct;
        /* 11. Apply (5/12)% Growth Rate to Contributions */
        currentVal_saveAcct += (annContr_saveAcct/2.4 * (annIntRate_saveAcct/100));
      }
      /* 12. Push End Value */
      // if (i >= (ages.retire - ages.age)) {
        retire.invAccts.saveAcct.endValue.push(currentVal_saveAcct);
      // } else {
      //   retire.invAccts.saveAcct.endValue.push(0);
      // }
    }
  }

  // INVESTMENT ACCOUNTS
  /* 1. If Account == Active */
  if (data.investmentAcct) {
    /* 2. Create records in retire object */
    retire.invAccts.investmentAcct = {beginValue: [], overflow: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_investAcct = data.investmentAcct.currentVal_investAcct;
    var endAgeContr_investAcct = (data.investmentAcct.endAgeContr_investAcct > ages.retire) ? ages.retire : data.investmentAcct.endAgeContr_investAcct;
    var annContr_investAcct = parseInt(data.investmentAcct.annContr_investAcct) || 0;
    for (let i=0; i<ages.cycle; i++) {
      // retire.invAccts.investmentAcct.overflow.push(0);
      /* #. Check Retirement Age */
      if (i < (ages.retire - ages.age)) {
        /* 4. Push Begin Value */
        retire.invAccts.investmentAcct.beginValue.push(currentVal_investAcct);
        retire.invAccts.investmentAcct.withdrawal.push(0);
      } else {
        // /* #. Collect surplus from previous year */
        // if (retire.totals.subTotals.remaining[i-1] < 0) {
        //   currentVal_investAcct += Math.abs(retire.totals.subTotals.remaining[i-1]);
        //   retire.invAccts.investmentAcct.overflow[i] += Math.abs(retire.totals.subTotals.remaining[i-1]);
        // }
        retire.invAccts.investmentAcct.beginValue.push(currentVal_investAcct);
        /* 5. Determine and Set Withdrawal Amount */
        if (retire.totals.subTotals.remaining[i] > 0) {
          if (currentVal_investAcct >= retire.totals.subTotals.remaining[i]) {
            retire.invAccts.investmentAcct.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.invAccts.investmentAcct.withdrawal.push(currentVal_investAcct);
          }
        } else {
          retire.invAccts.investmentAcct.withdrawal.push(0);
        }
      }
      currentVal_investAcct -= retire.invAccts.investmentAcct.withdrawal[i];
      retire.totals.subTotals.remaining[i] -= retire.invAccts.investmentAcct.withdrawal[i];
      /* 6. Prevent interest accrual once current value = 0 */
      if (!currentVal_investAcct == 0) {
        /* 7. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_investAcct += (retire.invAccts.investmentAcct.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 8. Apply Growth Rate */
        currentVal_investAcct *= investGrowth(i);
      }
      /* 9. Accrue Contributions */
      if (i <= (endAgeContr_investAcct - ages.age)) {
        currentVal_investAcct += annContr_investAcct;
        /* 10. Apply (5/12)% Growth Rate to Contributions */
        currentVal_investAcct += (annContr_investAcct/2.4 * (investGrowth(i)-1));
      }
      /* 11. Push End Value */
      // if (i >= (ages.retire - ages.age)) {
      //   retire.invAccts.investmentAcct.endValue.push(currentVal_investAcct);
      // } else {
      //   retire.invAccts.investmentAcct.endValue.push(currentVal_investAcct);
      // }
      retire.invAccts.investmentAcct.endValue.push(currentVal_investAcct);
    }
  }
  
  // TRADITIONAL ACCOUNTS
  /* 1. If Account == Active */
  if(data.tradAccts) {
    /* 2. Create records in retire object */
    retire.tradAccts.tradEca = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_tradAccts = data.tradAccts.currentVal_tradAccts;
    var empContr_tradAccts = parseFloat(data.tradAccts.empContr_tradAccts) || 0;
    var annContr_tradAccts = parseFloat(data.tradAccts.annContr_tradAccts) || 0;
    var endAgeContr_tradAccts = (data.tradAccts.endAgeContr_tradAccts > ages.retire) ? ages.retire : data.tradAccts.endAgeContr_tradAccts;
    var catchUpContr_tradAccts = data.tradAccts.catchUpContr_tradAccts;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.tradAccts.tradEca.beginValue.push(currentVal_tradAccts);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_tradAccts == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.tradAccts.tradEca.withdrawal.push(0);
          retire.tradAccts.tradEca.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_tradAccts >= retire.totals.subTotals.remaining[i]) {
            retire.tradAccts.tradEca.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.tradAccts.tradEca.withdrawal.push(currentVal_tradAccts);
          }
          currentVal_tradAccts -= retire.tradAccts.tradEca.withdrawal[i];
          retire.totals.subTotals.remaining[i] -= retire.tradAccts.tradEca.withdrawal[i];
          retire.tradAccts.tradEca.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i > (69 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdTrad = currentVal_tradAccts / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.tradAccts.tradEca.rmd.push(rmdTrad);
          currentVal_tradAccts -= rmdTrad;
          retire.totals.subTotals.remaining[i] -= rmdTrad;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.subTotals.remaining[i] > 0) {
            if (currentVal_tradAccts >= retire.totals.subTotals.remaining[i]) {
              retire.tradAccts.tradEca.withdrawal.push(retire.totals.subTotals.remaining[i]);
            } else {
              retire.tradAccts.tradEca.withdrawal.push(currentVal_tradAccts);
            }
            retire.totals.subTotals.remaining[i] -= retire.tradAccts.tradEca.withdrawal[i];
            currentVal_tradAccts -= retire.tradAccts.tradEca.withdrawal[i];
          } else {
            retire.tradAccts.tradEca.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_tradAccts > 0) {
            currentVal_tradAccts += (rmdTrad/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.tradAccts.tradEca.rmd.push(0);
          retire.tradAccts.tradEca.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_tradAccts > 0
          && retire.tradAccts.tradEca.withdrawal[i] > 0) {
          currentVal_tradAccts += (retire.tradAccts.tradEca.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_tradAccts *= investGrowth(i);
      } else {
        retire.tradAccts.tradEca.rmd.push(0);
        retire.tradAccts.tradEca.withdrawal.push(0);
      }
      /* 15. Accrue Personal/Employer Contributions */
      if (i <= (endAgeContr_tradAccts - ages.age)) {
        currentVal_tradAccts += (empContr_tradAccts + annContr_tradAccts);
        /* 16. Apply (5/12)% Growth Rate to Personal/Employer Contributions */
        currentVal_tradAccts += ((empContr_tradAccts + annContr_tradAccts)/2.4 * (investGrowth(i)-1));
        /* 17. Accrue Catch Up Contributions */
        if ((catchUpContr_tradAccts == true) && (i >= (50 - ages.age))) {
          currentVal_tradAccts += 6500;
          /* 18. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentVal_tradAccts += (6500/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 19. Push End Value */
      retire.tradAccts.tradEca.endValue.push(currentVal_tradAccts);
    }
  }
  // SIMPLE 401k
  /* 1. If Account == Active */
  if(data.simple401) {
    /* 2. Create records in retire object */
    retire.tradAccts.simple401 = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_simple401 = data.simple401.currentVal_simple401;
    var empContr_simple401 = parseFloat(data.simple401.empContr_simple401) || 0;
    var annContr_simple401 = parseFloat(data.simple401.annContr_simple401) || 0;
    var endAgeContr_simple401 = (data.simple401.endAgeContr_simple401 > ages.retire) ? ages.retire : data.simple401.endAgeContr_simple401;
    var catchUpContr_simple401 = data.simple401.catchUpContr_simple401;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.tradAccts.simple401.beginValue.push(currentVal_simple401);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_simple401 == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.tradAccts.simple401.withdrawal.push(0);
          retire.tradAccts.simple401.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_simple401 >= retire.totals.subTotals.remaining[i]) {
            retire.tradAccts.simple401.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.tradAccts.simple401.withdrawal.push(currentVal_simple401);
          }
          currentVal_simple401 -= retire.tradAccts.simple401.withdrawal[i];
          retire.totals.subTotals.remaining[i] -= retire.tradAccts.simple401.withdrawal[i];
          retire.tradAccts.simple401.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdSimple401 = currentVal_simple401 / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.tradAccts.simple401.rmd.push(rmdSimple401);
          currentVal_simple401 -= rmdSimple401;
          retire.totals.subTotals.remaining[i] -= rmdSimple401;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.subTotals.remaining[i] > 0) {
            if (currentVal_simple401 >= retire.totals.subTotals.remaining[i]) {
              retire.tradAccts.simple401.withdrawal.push(retire.totals.subTotals.remaining[i]);
            } else {
              retire.tradAccts.simple401.withdrawal.push(currentVal_simple401);
            }
            retire.totals.subTotals.remaining[i] -= retire.tradAccts.simple401.withdrawal[i];
            currentVal_simple401 -= retire.tradAccts.simple401.withdrawal[i];
          } else {
            retire.tradAccts.simple401.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_simple401 > 0) {
            currentVal_simple401 += (rmdSimple401/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.tradAccts.simple401.rmd.push(0);
          retire.tradAccts.simple401.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_simple401 > 0
          && retire.tradAccts.simple401.withdrawal[i] > 0) {
          currentVal_simple401 += (retire.tradAccts.simple401.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_simple401 *= investGrowth(i);
      } else {
        retire.tradAccts.simple401.rmd.push(0);
        retire.tradAccts.simple401.withdrawal.push(0);
      }
      /* 15. Accrue Personal/Employer Contributions */
      if (i <= (endAgeContr_simple401 - ages.age)) {
        currentVal_simple401 += (empContr_simple401 + annContr_simple401);
        /* 16. Apply (5/12)% Growth Rate to Personal/Employer Contributions */
        currentVal_simple401 += ((empContr_simple401 + annContr_simple401)/2.4 * (investGrowth(i)-1));
        /* 17. Accrue Catch Up Contributions */
        if ((catchUpContr_simple401 == true) && (i >= (50 - ages.age))) {
          currentVal_simple401 += 6500;
          /* 18. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentVal_simple401 += (6500/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 19. Push End Value */
      retire.tradAccts.simple401.endValue.push(currentVal_simple401);
    }
  }
    // SIMPLE IRA
  /* 1. If Account == Active */
  if(data.simpleIra) {
    /* 2. Create records in retire object */
    retire.tradAccts.simpleIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_simpleIra = data.simpleIra.currentVal_simpleIra;
    var empContr_simpleIra = parseFloat(data.simpleIra.empContr_simpleIra) || 0;
    var annContr_simpleIra = parseFloat(data.simpleIra.annContr_simpleIra) || 0;
    var endAgeContr_simpleIra = (data.simpleIra.endAgeContr_simpleIra > ages.retire) ? ages.retire : data.simpleIra.endAgeContr_simpleIra;
    var catchUpContr_simpleIra = data.simpleIra.catchUpContr_simpleIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.tradAccts.simpleIra.beginValue.push(currentVal_simpleIra);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_simpleIra == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.tradAccts.simpleIra.withdrawal.push(0);
          retire.tradAccts.simpleIra.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_simpleIra >= retire.totals.subTotals.remaining[i]) {
            retire.tradAccts.simpleIra.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.tradAccts.simpleIra.withdrawal.push(currentVal_simpleIra);
          }
          currentVal_simpleIra -= retire.tradAccts.simpleIra.withdrawal[i];
          retire.totals.subTotals.remaining[i] -= retire.tradAccts.simpleIra.withdrawal[i];
          retire.tradAccts.simpleIra.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdSimpleIra = currentVal_simpleIra / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.tradAccts.simpleIra.rmd.push(rmdSimpleIra);
          currentVal_simpleIra -= rmdSimpleIra;
          retire.totals.subTotals.remaining[i] -= rmdSimpleIra;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.subTotals.remaining[i] > 0) {
            if (currentVal_simpleIra >= retire.totals.subTotals.remaining[i]) {
              retire.tradAccts.simpleIra.withdrawal.push(retire.totals.subTotals.remaining[i]);
            } else {
              retire.tradAccts.simpleIra.withdrawal.push(currentVal_simpleIra);
            }
            retire.totals.subTotals.remaining[i] -= retire.tradAccts.simpleIra.withdrawal[i];
            currentVal_simpleIra -= retire.tradAccts.simpleIra.withdrawal[i];
          } else {
            retire.tradAccts.simpleIra.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_simpleIra > 0) {
            currentVal_simpleIra += (rmdSimpleIra/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.tradAccts.simpleIra.rmd.push(0);
          retire.tradAccts.simpleIra.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_simpleIra > 0
          && retire.tradAccts.simpleIra.withdrawal[i] > 0) {
          currentVal_simpleIra += (retire.tradAccts.simpleIra.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_simpleIra *= investGrowth(i);
      } else {
        retire.tradAccts.simpleIra.rmd.push(0);
        retire.tradAccts.simpleIra.withdrawal.push(0);
      }
      /* 15. Accrue Personal/Employer Contributions */
      if (i <= (endAgeContr_simpleIra - ages.age)) {
        currentVal_simpleIra += (empContr_simpleIra + annContr_simpleIra);
        /* 16. Apply (5/12)% Growth Rate to Personal/Employer Contributions */
        currentVal_simpleIra += ((empContr_simpleIra + annContr_simpleIra)/2.4 * (investGrowth(i)-1));
        /* 17. Accrue Catch Up Contributions */
        if ((catchUpContr_simpleIra == true) && (i >= (50 - ages.age))) {
          currentVal_simpleIra += 6500;
          /* 18. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentVal_simpleIra += (6500/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 19. Push End Value */
      retire.tradAccts.simpleIra.endValue.push(currentVal_simpleIra);
    }
  }
  // TRAD IRA
  /* 1. If Account == Active */
  if(data.tradIra) {
    /* 2. Create records in retire object */
    retire.tradAccts.tradIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_tradIra = data.tradIra.currentVal_tradIra;
    var endAgeContr_tradIra = (data.tradIra.endAgeContr_tradIra > ages.retire) ? ages.retire : data.tradIra.endAgeContr_tradIra;
    var annContr_tradIra = parseFloat(data.tradIra.annContr_tradIra) || 0;
    var catchUpContr_tradIra = data.tradIra.catchUpContr_tradIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.tradAccts.tradIra.beginValue.push(currentVal_tradIra);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_tradIra == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.tradAccts.tradIra.withdrawal.push(0);
          retire.tradAccts.tradIra.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_tradIra >= retire.totals.subTotals.remaining[i]) {
            retire.tradAccts.tradIra.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.tradAccts.tradIra.withdrawal.push(currentVal_tradIra);
          }
          currentVal_tradIra -= retire.tradAccts.tradIra.withdrawal[i];
          retire.totals.subTotals.remaining[i] -= retire.tradAccts.tradIra.withdrawal[i];
          retire.tradAccts.tradIra.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdTradIra = currentVal_tradIra / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.tradAccts.tradIra.rmd.push(rmdTradIra);
          currentVal_tradIra -= rmdTradIra;
          retire.totals.subTotals.remaining[i] -= rmdTradIra;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.subTotals.remaining[i] > 0) {
            if (currentVal_tradIra >= retire.totals.subTotals.remaining[i]) {
              retire.tradAccts.tradIra.withdrawal.push(retire.totals.subTotals.remaining[i]);
            } else {
              retire.tradAccts.tradIra.withdrawal.push(currentVal_tradIra);
            }
            retire.totals.subTotals.remaining[i] -= retire.tradAccts.tradIra.withdrawal[i];
            currentVal_tradIra -= retire.tradAccts.tradIra.withdrawal[i];
          } else {
            retire.tradAccts.tradIra.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_tradIra > 0) {
            currentVal_tradIra += (rmdTradIra/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.tradAccts.tradIra.rmd.push(0);
          retire.tradAccts.tradIra.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_tradIra > 0
          && retire.tradAccts.tradIra.withdrawal[i] > 0) {
          currentVal_tradIra += (retire.tradAccts.tradIra.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_tradIra *= investGrowth(i);
      } else {
        retire.tradAccts.tradIra.rmd.push(0);
        retire.tradAccts.tradIra.withdrawal.push(0);
      }
      /* 15. Accrue Personal/Employer Contributions */
      if (i <= (endAgeContr_tradIra - ages.age)) {
        currentVal_tradIra += annContr_tradIra;
        /* 16. Apply (5/12)% Growth Rate to Personal/Employer Contributions */
        currentVal_tradIra += (annContr_tradIra/2.4 * (investGrowth(i)-1));
        /* 17. Accrue Catch Up Contributions */
        if ((catchUpContr_tradIra == true) && (i >= (50 - ages.age))) {
          currentVal_tradIra += 6500;
          /* 18. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentVal_tradIra += (6500/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 19. Push End Value */
      retire.tradAccts.tradIra.endValue.push(currentVal_tradIra);
    }
  }

  // ROTH ECA ACCOUNTS
  /* 1. If Account == Active */
  if(data.rothAccts) {
    /* 2. Create records in retire object */
    retire.rothAccts.rothEca = {principal: [], beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var contrVal_rothAccts = data.rothAccts.contrVal_rothAccts;
    var currentVal_rothAccts = data.rothAccts.currentVal_rothAccts;
    var empContr_rothAccts = parseFloat(data.rothAccts.empContr_rothAccts) || 0;
    var annContr_rothAccts = parseFloat(data.rothAccts.annContr_rothAccts) || 0;
    var endAgeContr_rothAccts = (data.rothAccts.endAgeContr_rothAccts > ages.retire) ? ages.retire : data.rothAccts.endAgeContr_rothAccts;
    var catchUpContr_rothAccts = data.rothAccts.catchUpContr_rothAccts;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value for Total and Contributions */
      retire.rothAccts.rothEca.beginValue.push(currentVal_rothAccts);
      /* 5. Determine Withdrawal Amount */
      if (retire.totals.subTotals.remaining[i] > 0) {
        /* 6. Age threshold: Withdraw against contributions before age 59 */
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (contrVal_rothAccts/((59 - ages.retire) - retCount()) < retire.totals.subTotals.remaining[i]) {
            retire.rothAccts.rothEca.withdrawal.push(contrVal_rothAccts/((59 - ages.retire) - retCount()));
          } else {
            retire.rothAccts.rothEca.withdrawal.push(retire.totals.subTotals.remaining[i]);
          };
          /* 7. Deduct withdrawal from total contributions */
          if (contrVal_rothAccts > retire.rothAccts.rothEca.withdrawal[i]) {
            contrVal_rothAccts -= retire.rothAccts.rothEca.withdrawal[i];
          } else {
            contrVal_rothAccts = 0;
          }
        } else if (i >= (59 - ages.age)) {
          /* 8. Age threshold: Withdraw against balance after age 59 */
          if (currentVal_rothAccts >= retire.totals.subTotals.remaining[i]) {
            retire.rothAccts.rothEca.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.rothAccts.rothEca.withdrawal.push(currentVal_rothAccts);
          }
        } else {
          retire.rothAccts.rothEca.withdrawal.push(0);
        }
      } else {
        retire.rothAccts.rothEca.withdrawal.push(0);
      }
      /* 9. Deduct withdrawal from current value and from retire...remaining */
      currentVal_rothAccts -= retire.rothAccts.rothEca.withdrawal[i];
      retire.totals.subTotals.remaining[i] -= retire.rothAccts.rothEca.withdrawal[i];
      /* 10. Prevent interest accrual once current value = 0 */
      if (!currentVal_rothAccts == 0) {
        /* 11. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_rothAccts += (retire.rothAccts.rothEca.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 12. Apply Growth Rate */
        currentVal_rothAccts *= investGrowth(i);
      }
      /* 13. Accrue Contributions */
      if (i <= (endAgeContr_rothAccts - ages.age)) {
        currentVal_rothAccts += (annContr_rothAccts + empContr_rothAccts);
        contrVal_rothAccts += annContr_rothAccts;
        /* 14. Apply (5/12)% Growth Rate to Contributions */
        currentVal_rothAccts += ((annContr_rothAccts + empContr_rothAccts)/2.4 * (investGrowth(i)-1));
        /* 15. Accrue Catch Up Contributions */
        if ((catchUpContr_rothAccts == true) && (i >= (50 - ages.age))) {
          currentVal_rothAccts += 6500;
          contrVal_rothAccts += 6500;
          /* 16. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentVal_rothAccts += (6500/2.4 * (investGrowth(i)-1));
        };
      };
      /* 17. Push End Value */
      retire.rothAccts.rothEca.endValue.push(currentVal_rothAccts);
      if (contrVal_rothAccts > retire.rothAccts.rothEca.endValue[i]) {
        retire.rothAccts.rothEca.principal.push(retire.rothAccts.rothEca.endValue[i]);
      } else {
        retire.rothAccts.rothEca.principal.push(contrVal_rothAccts);
      }
    }
  }
  // ROTH IRA
    /* 1. If Account == Active */
  if(data.rothIra) {
    /* 2. Create records in retire object */
    retire.rothAccts.rothIra = {principal: [], beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var contrVal_rothIra = data.rothIra.contrVal_rothIra;
    var currentVal_rothIra = data.rothIra.currentVal_rothIra;
    var annContr_rothIra = data.rothIra.annContr_rothIra;
    var catchUpContr_rothIra = data.rothIra.catchUpContr_rothIra;
    var endAgeContr_rothIra = (data.rothIra.endAgeContr_rothIra > ages.retire) ? ages.retire : data.rothIra.endAgeContr_rothIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value for Total and Contributions */
      retire.rothAccts.rothIra.beginValue.push(currentVal_rothIra);
      /* 5. Determine Withdrawal Amount */
      if (retire.totals.subTotals.remaining[i] > 0) {
        /* 6. Age threshold: Withdraw against contributions before age 59 */
        if (i < (ages.retire - ages.age)) {
          retire.rothAccts.rothIra.withdrawal.push(0);
        } else if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (contrVal_rothIra/((59 - ages.retire) - retCount()) < retire.totals.subTotals.remaining[i]) {
            retire.rothAccts.rothIra.withdrawal.push(contrVal_rothIra/((59 - ages.retire) - retCount()));
          } else {
            retire.rothAccts.rothIra.withdrawal.push(retire.totals.subTotals.remaining[i]);
          };
          /* 7. Deduct withdrawal from total contributions */
          if (contrVal_rothIra > retire.rothAccts.rothIra.withdrawal[i]) {
            contrVal_rothIra -= retire.rothAccts.rothIra.withdrawal[i];
          } else {
            contrVal_rothIra = 0;
          }
        } else if (i >= (59 - ages.age)) {
          /* 8. Age threshold: Withdraw against balance after age 59 */
          if (currentVal_rothIra >= retire.totals.subTotals.remaining[i]) {
            retire.rothAccts.rothIra.withdrawal.push(retire.totals.subTotals.remaining[i]);
          } else {
            retire.rothAccts.rothIra.withdrawal.push(currentVal_rothIra);
          }
        }
      } else {
        retire.rothAccts.rothIra.withdrawal.push(0);
      }
      /* 9. Deduct withdrawal from current value and from retire...remaining */
      currentVal_rothIra -= retire.rothAccts.rothIra.withdrawal[i];
      retire.totals.subTotals.remaining[i] -= retire.rothAccts.rothIra.withdrawal[i];
      /* 10. Prevent interest accrual once current value = 0 */
      if (!currentVal_rothIra == 0) {
        /* 11. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_rothIra += (retire.rothAccts.rothIra.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 12. Apply Growth Rate */
        currentVal_rothIra *= investGrowth(i);
        /* 13. Accrue Contributions */
        if (i <= (endAgeContr_rothIra - ages.age)) {
          currentVal_rothIra += annContr_rothIra;
          contrVal_rothIra += annContr_rothIra;
          /* 14. Apply (5/12)% Growth Rate to Contributions */
          currentVal_rothIra += (annContr_rothIra/2.4 * (investGrowth(i)-1));
          /* 15. Accrue Catch Up Contributions */
          if ((catchUpContr_rothIra == true) && (i >= (50 - ages.age))) {
            currentVal_rothIra += 1000;
            contrVal_rothIra += 1000;
            /* 16. Apply (5/12)% Growth Rate to Catch Up Contributions */
            currentVal_rothIra += (1000/2.4 * (investGrowth(i)-1));
          };
        };
      };
      /* 17. Push End Value */
      retire.rothAccts.rothIra.endValue.push(currentVal_rothIra);
      if (contrVal_rothIra > retire.rothAccts.rothIra.endValue[i]) {
        retire.rothAccts.rothIra.principal.push(retire.rothAccts.rothIra.endValue[i]);
      } else {
        retire.rothAccts.rothIra.principal.push(contrVal_rothIra);
      }
    }
  }

  let allZeroes = true;
  retire.totals.subTotals.remaining.forEach((item,i,arr)=>{
    if (i >= (ages.retire - ages.age) && arr[i] > 0) {
      allZeroes = false;
    }
  });

    /* IF REMAINING < 0, MOVE BALANCE TO AN INVESTMENT ACCOUNT */
    switch(true) {
      case (allZeroes == true && zeroFlag == 0 && ssiFlag == 0):
        zeroFlag = 1;
        portfolio(ages.retire -= 1,ssiAge);
        break;
      case (allZeroes == true && zeroFlag == 1 && ssiFlag == 0): 
        if (ages.retire > ages.age) {
          if (loopFlag == 1) {
            break;
          } else {
            portfolio(ages.retire -=1,ssiAge);
          }
        };
        break;
      case (allZeroes == true && zeroFlag == 0 && ssiFlag == 1):
        portFlag = 1;
        break;
      case (allZeroes == true && zeroFlag == 1 && ssiFlag == 1):
        portFlag = 1;
        break;
      case (allZeroes == false && zeroFlag == 0 && ssiFlag == 0):
        if (ages.retire < 70) {
            portfolio(ages.retire += 1);
          } else {
            ssiFlag = 1;
            portfolio();
          };
        break;
      case (allZeroes == false && zeroFlag == 1 && ssiFlag == 0):
        if (ssiAge != null) {
          ssiFlag = 1;
          portfolio(ages.retire,ssiAge += 1);
        } else {
          loopFlag = 1;
          portfolio(ages.retire += 1,ssiAge);
        }
        break;
      case (allZeroes == false && zeroFlag == 0 && ssiFlag == 1):
        if (ssiAge < 70) {
          portfolio(ages.retire,ssiAge +=1);
        } else if (ssiAge === 70 && ages.retire < ages.death-1) {
          portfolio(ages.retire +=1, ssiAge < 70 ? ssiAge +=1 : 62);
        } else if (ssiAge === 70 && ages.retire === ages.death) {
          portFlag = 1;
          break;
        };
        break;
      case (allZeroes == false && zeroFlag == 1 && ssiFlag == 1):
        if (ssiAge < 70) {
          portfolio(ages.retire,ssiAge += 1);
        } else if (ssiAge == 70) {
          portfolio(ages.retire += 1, data.socialSecurity.beginAge_ssi);
        } else {break;};
        break;
    }
    (ages.retire +1) == ages.death ? retire.retAge = false : retire.retAge = ages.retire;
  }
  if (portFlag === 0) {portfolio();}

  if (typeof(Storage) !== "undefined") {
    localStorage.ssiAge = ssiAge;
    localStorage.retireData = JSON.stringify(retire);
  } else {
    window.retire;
    window.ssiAge;
  }
  // console.log(retire);
};

export {income, calcAge};