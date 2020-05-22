import {harvest} from './survey.js';
import {life, growthRate, rmd} from './data.js';

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
  return {
    currentYr: new Date().getFullYear(),
    age: age,
    retire: parseInt(data.demographics.retAge),
    death: le,
    cycle: le - age
  };
}

var income = () => {
  let ages = calcAge();
  let data = harvest();
  let investGrowth = (i) => {return i >= (65 - ages.age) ? 1+growthRate.inflation : 1+growthRate.sp500};
  
  var retire = {};
  retire.dates = {year: [], age: []};
  retire.totals = {required: [], income: [], remaining: [], taxes: []};
  let targetSalAmt = parseInt(data.demographics.retSal);
  var retCount = () => {
    let count = 0;
    for (let j=(ages.retire - ages.age); j<(59 - ages.age); j++) {if (retire.totals.remaining[j] == 0) {count++;}}
    return count;
  };
  for (let i=0;i<ages.cycle;i++) {
    retire.dates.year.push(ages.currentYr+i);
    retire.dates.age.push(ages.age+i);
      retire.totals.income.push(+(targetSalAmt).toFixed(2));
      retire.totals.taxes.push(+(targetSalAmt*0.2).toFixed(2));
      retire.totals.required.push(+(targetSalAmt*1.2).toFixed(2));
      retire.totals.remaining.push(+(targetSalAmt*1.2).toFixed(2));
    targetSalAmt *= 1+growthRate.inflation 
  };
  retire.income = {};
  // SOCIAL SECURITY
  if(data.ssi) {
    retire.income.ssi = {annual: []};
    let ssiRate = 0;
    switch (data.ssi.beginAge_ssi) { 
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
    let ssiAmount = data.ssi.annAmt_ssi * ssiRate;
    for (let i=0; i<ages.cycle; i++) {
      if (i < (data.ssi.beginAge_ssi - ages.age)) {
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
        retire.totals.remaining[i] -= penAmount;
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
        retire.totals.remaining[i] -= fersAmount;
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
        retire.totals.remaining[i] -= annAmount;
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
        retire.totals.remaining[i] -= vaAmount;
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
        retire.totals.remaining[i] -= ssiDisAmount;
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
        retire.totals.remaining[i] -= oDisAmount;
      }
      oDisAmount *=1+disCola;
    }
  };
  // RETIREMENT SALARY
  if(data.retireSal) {
    retire.income.retireSal = {annual: []};
    let retSalAmount = data.retireSal.annAmt_retireSal;
    for (let i=0; i<ages.cycle; i++) {
      if (i < data.retireSal.beginAge_retireSal - ages.age) {
        retire.income.retireSal.annual.push(0);
      } else if (i < data.retireSal.endAge_retireSal - ages.age) {
        retire.income.retireSal.annual.push(retSalAmount);
        retire.totals.remaining[i] -= retSalAmount;
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
        retire.totals.remaining[i] -= rentAmount;
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
        retire.totals.remaining[i] -= oBenAmount;
      }
      oBenAmount *= 1+oBenCola;
    }
  };
  retire.invAccts = {};
  // INVESTMENT ACCOUNTS
  /* 1. If Account == Active */
  if(data.investAcct) {
    /* 2. Create records in retire object */
    retire.invAccts.investAcct = {beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_investAcct = data.investAcct.currentVal_investAcct;
    var endAgeContr_investAcct = data.investAcct.endAgeContr_investAcct;
    var annContr_investAcct = data.investAcct.annContr_investAcct;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.invAccts.investAcct.beginValue.push(currentVal_investAcct);
      /* 5. Determine and Set Withdrawal Amount */
      if (retire.totals.remaining[i] > 0) {
        if (currentVal_investAcct >= retire.totals.remaining[i]) {
          retire.invAccts.investAcct.withdrawal.push(retire.totals.remaining[i]);
        } else {
          retire.invAccts.investAcct.withdrawal.push(currentVal_investAcct);
        }
      } else {
        retire.invAccts.investAcct.withdrawal.push(0);
      }
      currentVal_investAcct -= retire.invAccts.investAcct.withdrawal[i];
      retire.totals.remaining[i] -= retire.invAccts.investAcct.withdrawal[i];
      /* 6. Prevent interest accrual once current value = 0 */
      if (!currentVal_investAcct == 0) {
        /* 7. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_investAcct += (retire.invAccts.investAcct.withdrawal[i]/2.4 * (investGrowth(i)-1));
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
      retire.invAccts.investAcct.endValue.push(currentVal_investAcct);      
    }
  }

  retire.ecaAccts = {};
  // TRADITIONAL ACCOUNTS
  /* 1. If Account == Active */
  if(data.tradAccts) {
    /* 2. Create records in retire object */
    retire.ecaAccts.tradAccts = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_tradAccts = data.tradAccts.currentVal_tradAccts;
    var empContr_tradAccts = parseFloat(data.tradAccts.empContr_tradAccts) || 0;
    var annContr_tradAccts = parseFloat(data.tradAccts.annContr_tradAccts) || 0;
    var endAgeContr_tradAccts = data.tradAccts.endAgeContr_tradAccts;
    var catchUpContr_tradAccts = data.tradAccts.catchUpContr_tradAccts;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.ecaAccts.tradAccts.beginValue.push(currentVal_tradAccts);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_tradAccts == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.ecaAccts.tradAccts.withdrawal.push(0);
          retire.ecaAccts.tradAccts.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_tradAccts >= retire.totals.remaining[i]) {
            retire.ecaAccts.tradAccts.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.ecaAccts.tradAccts.withdrawal.push(currentVal_tradAccts);
          }
          currentVal_tradAccts -= retire.ecaAccts.tradAccts.withdrawal[i];
          retire.totals.remaining[i] -= retire.ecaAccts.tradAccts.withdrawal[i];
          retire.ecaAccts.tradAccts.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdTrad = currentVal_tradAccts / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.ecaAccts.tradAccts.rmd.push(rmdTrad);
          currentVal_tradAccts -= rmdTrad;
          retire.totals.remaining[i] -= rmdTrad;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.remaining[i] > 0) {
            if (currentVal_tradAccts >= retire.totals.remaining[i]) {
              retire.ecaAccts.tradAccts.withdrawal.push(retire.totals.remaining[i]);
            } else {
              retire.ecaAccts.tradAccts.withdrawal.push(currentVal_tradAccts);
            }
            retire.totals.remaining[i] -= retire.ecaAccts.tradAccts.withdrawal[i];
            currentVal_tradAccts -= retire.ecaAccts.tradAccts.withdrawal[i];
          } else {
            retire.ecaAccts.tradAccts.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_tradAccts > 0) {
            currentVal_tradAccts += (rmdTrad/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.ecaAccts.tradAccts.rmd.push(0);
          retire.ecaAccts.tradAccts.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_tradAccts > 0
          && retire.ecaAccts.tradAccts.withdrawal[i] > 0) {
          currentVal_tradAccts += (retire.ecaAccts.tradAccts.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_tradAccts *= investGrowth(i);
      } else {
        retire.ecaAccts.tradAccts.rmd.push(0);
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
      retire.ecaAccts.tradAccts.endValue.push(currentVal_tradAccts);
    }
  }
  // SIMPLE IRA
  /* 1. If Account == Active */
  if(data.simpleIra) {
    /* 2. Create records in retire object */
    retire.ecaAccts.simpleIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_simpleIra = data.simpleIra.currentVal_simpleIra;
    var empContr_simpleIra = parseFloat(data.simpleIra.empContr_simpleIra) || 0;
    var annContr_simpleIra = parseFloat(data.simpleIra.annContr_simpleIra) || 0;
    var endAgeContr_simpleIra = data.simpleIra.endAgeContr_simpleIra;
    var catchUpContr_simpleIra = data.simpleIra.catchUpContr_simpleIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.ecaAccts.simpleIra.beginValue.push(currentVal_simpleIra);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_simpleIra == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.ecaAccts.simpleIra.withdrawal.push(0);
          retire.ecaAccts.simpleIra.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_simpleIra >= retire.totals.remaining[i]) {
            retire.ecaAccts.simpleIra.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.ecaAccts.simpleIra.withdrawal.push(currentVal_simpleIra);
          }
          currentVal_simpleIra -= retire.ecaAccts.simpleIra.withdrawal[i];
          retire.totals.remaining[i] -= retire.ecaAccts.simpleIra.withdrawal[i];
          retire.ecaAccts.simpleIra.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdSimpleIra = currentVal_simpleIra / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.ecaAccts.simpleIra.rmd.push(rmdSimpleIra);
          currentVal_simpleIra -= rmdSimpleIra;
          retire.totals.remaining[i] -= rmdSimpleIra;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.remaining[i] > 0) {
            if (currentVal_simpleIra >= retire.totals.remaining[i]) {
              retire.ecaAccts.simpleIra.withdrawal.push(retire.totals.remaining[i]);
            } else {
              retire.ecaAccts.simpleIra.withdrawal.push(currentVal_simpleIra);
            }
            retire.totals.remaining[i] -= retire.ecaAccts.simpleIra.withdrawal[i];
            currentVal_simpleIra -= retire.ecaAccts.simpleIra.withdrawal[i];
          } else {
            retire.ecaAccts.simpleIra.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_simpleIra > 0) {
            currentVal_simpleIra += (rmdSimpleIra/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.ecaAccts.simpleIra.rmd.push(0);
          retire.ecaAccts.simpleIra.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_simpleIra > 0
          && retire.ecaAccts.simpleIra.withdrawal[i] > 0) {
          currentVal_simpleIra += (retire.ecaAccts.simpleIra.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_simpleIra *= investGrowth(i);
      } else {
        retire.ecaAccts.simpleIra.rmd.push(0);
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
      retire.ecaAccts.simpleIra.endValue.push(currentVal_simpleIra);
    }
  }
  // SIMPLE 401k
  /* 1. If Account == Active */
  if(data.simple401) {
    /* 2. Create records in retire object */
    retire.ecaAccts.simple401 = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_simple401 = data.simple401.currentVal_simple401;
    var empContr_simple401 = parseFloat(data.simple401.empContr_simple401) || 0;
    var annContr_simple401 = parseFloat(data.simple401.annContr_simple401) || 0;
    var endAgeContr_simple401 = data.simple401.endAgeContr_simple401;
    var catchUpContr_simple401 = data.simple401.catchUpContr_simple401;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.ecaAccts.simple401.beginValue.push(currentVal_simple401);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_simple401 == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.ecaAccts.simple401.withdrawal.push(0);
          retire.ecaAccts.simple401.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_simple401 >= retire.totals.remaining[i]) {
            retire.ecaAccts.simple401.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.ecaAccts.simple401.withdrawal.push(currentVal_simple401);
          }
          currentVal_simple401 -= retire.ecaAccts.simple401.withdrawal[i];
          retire.totals.remaining[i] -= retire.ecaAccts.simple401.withdrawal[i];
          retire.ecaAccts.simple401.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdSimple401 = currentVal_simple401 / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.ecaAccts.simple401.rmd.push(rmdTrad);
          currentVal_simple401 -= rmdSimple401;
          retire.totals.remaining[i] -= rmdSimple401;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.remaining[i] > 0) {
            if (currentVal_simple401 >= retire.totals.remaining[i]) {
              retire.ecaAccts.simple401.withdrawal.push(retire.totals.remaining[i]);
            } else {
              retire.ecaAccts.simple401.withdrawal.push(currentVal_simple401);
            }
            retire.totals.remaining[i] -= retire.ecaAccts.simple401.withdrawal[i];
            currentVal_simple401 -= retire.ecaAccts.simple401.withdrawal[i];
          } else {
            retire.ecaAccts.simple401.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_simple401 > 0) {
            currentVal_simple401 += (rmdSimple401/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.ecaAccts.simple401.rmd.push(0);
          retire.ecaAccts.simple401.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_simple401 > 0
          && retire.ecaAccts.simple401.withdrawal[i] > 0) {
          currentVal_simple401 += (retire.ecaAccts.simple401.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_simple401 *= investGrowth(i);
      } else {
        retire.ecaAccts.simple401.rmd.push(0);
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
      retire.ecaAccts.simple401.endValue.push(currentVal_simple401);
    }
  }
  retire.iraAccts = {};
  // TRAD IRA
  /* 1. If Account == Active */
  if(data.tradIra) {
    /* 2. Create records in retire object */
    retire.iraAccts.tradIra = {beginValue: [], rmd: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var currentVal_tradIra = data.tradIra.currentVal_tradIra;
    var endAgeContr_tradIra = data.tradIra.endAgeContr_tradIra;
    var annContr_tradIra = parseFloat(data.tradIra.annContr_tradIra) || 0;
    var catchUpContr_tradIra = data.tradIra.catchUpContr_tradIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value */
      retire.iraAccts.tradIra.beginValue.push(currentVal_tradIra);
      /* 5. Prevent interest accrual once current value = 0 */
      if (!currentVal_tradIra == 0) {
        /* 6. If under 59, Push RMD & Withdrawal = 0 */
        if (i < (59 - ages.age)) {
          retire.iraAccts.tradIra.withdrawal.push(0);
          retire.iraAccts.tradIra.rmd.push(0);
        } /* 7. If 58 < 70, Push Withdrawal Amount */
        else if (i >= (59 - ages.age)
                && i < (70 - ages.age)) {
          if (currentVal_tradIra >= retire.totals.remaining[i]) {
            retire.iraAccts.tradIra.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.iraAccts.tradIra.withdrawal.push(currentVal_tradIra);
          }
          currentVal_tradIra -= retire.iraAccts.tradIra.withdrawal[i];
          retire.totals.remaining[i] -= retire.iraAccts.tradIra.withdrawal[i];
          retire.iraAccts.tradIra.rmd.push(0);
        } /* 8. If >69, Push RMD Amount + Additional Withdrawal */
        else if (i >= (70 - ages.age)) {
          /* 9. RMD Distribution */
          var rmdTradIra = currentVal_tradIra / rmd[ages.age + i];
          /* 10. Push RMD Value */
          retire.iraAccts.tradIra.rmd.push(rmdTradIra);
          currentVal_tradIra -= rmdTradIra;
          retire.totals.remaining[i] -= rmdTradIra;
          /* 11. Push Additional Withdrawal Value */
          if (retire.totals.remaining[i] > 0) {
            if (currentVal_tradIra >= retire.totals.remaining[i]) {
              retire.iraAccts.tradIra.withdrawal.push(retire.totals.remaining[i]);
            } else {
              retire.iraAccts.tradIra.withdrawal.push(currentVal_tradIra);
            }
            retire.totals.remaining[i] -= retire.iraAccts.tradIra.withdrawal[i];
            currentVal_tradIra -= retire.iraAccts.tradIra.withdrawal[i];
          } else {
            retire.iraAccts.tradIra.withdrawal.push(0);
          }
          /* 12. Apply (5/12)% Growth Rate to RMD amount */
          if (currentVal_tradIra > 0) {
            currentVal_tradIra += (rmdTradIra/2.4 * (investGrowth(i)-1));
          }
        } else {
          retire.iraAccts.tradIra.rmd.push(0);
          retire.iraAccts.tradIra.withdrawal.push(0);
        }
        /* 13. Apply (5/12)% Growth Rate to Withdrawal amount */
        if (currentVal_tradIra > 0
          && retire.iraAccts.tradIra.withdrawal[i] > 0) {
          currentVal_tradIra += (retire.iraAccts.tradIra.withdrawal[i]/2.4 * (investGrowth(i)-1)); 
        }
        /* 14. Apply Growth Rate */
        currentVal_tradIra *= investGrowth(i);
      } else {
        retire.iraAccts.tradIra.rmd.push(0);
      }
      /* 15. Accrue Personal/Employer Contributions */
      if (i <= (endAgeContr_tradIra - ages.age)) {
        currentVal_tradIra += (empContr_tradAcctsIra + annContr_tradIra);
        /* 16. Apply (5/12)% Growth Rate to Personal/Employer Contributions */
        currentVal_tradIra += ((empContr_tradAcctsIra + annContr_tradIra)/2.4 * (investGrowth(i)-1));
        /* 17. Accrue Catch Up Contributions */
        if ((catchUpContr_tradIra == true) && (i >= (50 - ages.age))) {
          currentVal_tradIra += 6500;
          /* 18. Apply (5/12)% Growth Rate to Catch Up Contributions */
          currentVal_tradIra += (6500/2.4 * (investGrowth(i)-1));
        };        
      }
      /* 19. Push End Value */
      retire.iraAccts.tradIra.endValue.push(currentVal_tradIra);
    }
  }
  // ROTH ECA ACCOUNTS
  /* 1. If Account == Active */
  if(data.rothAccts) {
    /* 2. Create records in retire object */
    retire.ecaAccts.rothAccts = {contributions: [], beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var contrVal_rothAccts = data.rothAccts.contrVal_rothAccts;
    var currentVal_rothAccts = data.rothAccts.currentVal_rothAccts;
    var empContr_rothAccts = parseFloat(data.rothAccts.empContr_rothAccts) || 0;
    var annContr_rothAccts = parseFloat(data.rothAccts.annContr_rothAccts) || 0;
    var endAgeContr_rothAccts = data.rothAccts.endAgeContr_rothAccts;
    var catchUpContr_rothAccts = data.rothAccts.catchUpContr_rothAccts;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value for Total and Contributions */
      retire.ecaAccts.rothAccts.beginValue.push(currentVal_rothAccts);
      /* 5. Determine Withdrawal Amount */
      if (retire.totals.remaining[i] > 0) {
        /* 6. Age threshold: Withdraw against contributions before age 59 */
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (contrVal_rothAccts/((59 - ages.retire) - retCount()) < retire.totals.remaining[i]) {
            retire.ecaAccts.rothAccts.withdrawal.push(contrVal_rothAccts/((59 - ages.retire) - retCount()));
          } else {
            retire.ecaAccts.rothAccts.withdrawal.push(retire.totals.remaining[i]);
          };
          /* 7. Deduct withdrawal from total contributions */
          if (contrVal_rothAccts > retire.ecaAccts.rothAccts.withdrawal[i]) {
            contrVal_rothAccts -= retire.ecaAccts.rothAccts.withdrawal[i];
          } else {
            contrVal_rothAccts = 0;
          }
        } else if (i >= (59 - ages.age)) {
          /* 8. Age threshold: Withdraw against balance after age 59 */
          if (currentVal_rothAccts >= retire.totals.remaining[i]) {
            retire.ecaAccts.rothAccts.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.ecaAccts.rothAccts.withdrawal.push(currentVal_rothAccts);
          }
        }
      } else {
        retire.ecaAccts.rothAccts.withdrawal.push(0);
      }
      /* 9. Deduct withdrawal from current value and from retire...remaining */
      currentVal_rothAccts -= retire.ecaAccts.rothAccts.withdrawal[i];
      retire.totals.remaining[i] -= retire.ecaAccts.rothAccts.withdrawal[i];
      /* 10. Prevent interest accrual once current value = 0 */
      if (!currentVal_rothAccts == 0) {
        /* 11. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_rothAccts += (retire.ecaAccts.rothAccts.withdrawal[i]/2.4 * (investGrowth(i)-1));
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
      retire.ecaAccts.rothAccts.endValue.push(currentVal_rothAccts);
      if (contrVal_rothAccts > retire.ecaAccts.rothAccts.endValue[i]) {
        retire.ecaAccts.rothAccts.contributions.push(retire.ecaAccts.rothAccts.endValue[i]);
      } else {
        retire.ecaAccts.rothAccts.contributions.push(contrVal_rothAccts);
      }
    }
  }
  // ROTH IRA
    /* 1. If Account == Active */
  if(data.rothIra) {
    /* 2. Create records in retire object */
    retire.iraAccts.rothIra = {contributions: [], beginValue: [], withdrawal: [], endValue: []};
    /* 3. Create internal variables from data (data.js) */
    var contrVal_rothIra = data.rothIra.contrVal_rothIra;
    var currentVal_rothIra = data.rothIra.currentVal_rothIra;
    var annContr_rothIra = data.rothIra.annContr_rothIra;
    var catchUpContr_rothIra = data.rothIra.catchUpContr_rothIra;
    var endAgeContr_rothIra = data.rothIra.endAgeContr_rothIra;
    for (let i=0; i<ages.cycle; i++) {
      /* 4. Push Begin Value for Total and Contributions */
      retire.iraAccts.rothIra.beginValue.push(currentVal_rothIra);
      /* 5. Determine Withdrawal Amount */
      if (retire.totals.remaining[i] > 0) {
        /* 6. Age threshold: Withdraw against contributions before age 59 */
        if (i < (59 - ages.age) && i >= (ages.retire - ages.age)) {
          if (contrVal_rothIra/((59 - ages.retire) - retCount()) < retire.totals.remaining[i]) {
            retire.iraAccts.rothIra.withdrawal.push(contrVal_rothIra/((59 - ages.retire) - retCount()));
          } else {
            retire.iraAccts.rothIra.withdrawal.push(retire.totals.remaining[i]);
          };
          /* 7. Deduct withdrawal from total contributions */
          if (contrVal_rothIra > retire.iraAccts.rothIra.withdrawal[i]) {
            contrVal_rothIra -= retire.iraAccts.rothIra.withdrawal[i];
          } else {
            contrVal_rothIra = 0;
          }
        } else if (i >= (59 - ages.age)) {
          /* 8. Age threshold: Withdraw against balance after age 59 */
          if (currentVal_rothIra >= retire.totals.remaining[i]) {
            retire.iraAccts.rothIra.withdrawal.push(retire.totals.remaining[i]);
          } else {
            retire.iraAccts.rothIra.withdrawal.push(currentVal_rothIra);
          }
        }
      } else {
        retire.iraAccts.rothIra.withdrawal.push(0);
      }
      /* 9. Deduct withdrawal from current value and from retire...remaining */
      currentVal_rothIra -= retire.iraAccts.rothIra.withdrawal[i];
      retire.totals.remaining[i] -= retire.iraAccts.rothIra.withdrawal[i];
      /* 10. Prevent interest accrual once current value = 0 */
      if (!currentVal_rothIra == 0) {
        /* 11. Apply (5/12)% Growth Rate for Withdrawal Amount */
        currentVal_rothIra += (retire.iraAccts.rothIra.withdrawal[i]/2.4 * (investGrowth(i)-1));
        /* 12. Apply Growth Rate */
        currentVal_rothIra *= investGrowth(i);
      }
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
      /* 17. Push End Value */
      retire.iraAccts.rothIra.endValue.push(currentVal_rothIra);
      if (contrVal_rothIra > retire.iraAccts.rothIra.endValue[i]) {
        retire.iraAccts.rothIra.contributions.push(retire.iraAccts.rothIra.endValue[i]);
      } else {
        retire.iraAccts.rothIra.contributions.push(contrVal_rothIra);
      }
    }
  }
  console.log(retire);
};

export {income};