const data = {
  demographics: {
    dob:null,
    gender:null,
    salary:null,
    retAge:null,
    married:null,
    retState:null
  },
  ssi: {
    active:true,
    retirementAgeSsi:null,
    monthlyAmtSsi:null
  },
  genPension: {
    active:false,
    benBeginAgeGen:null,
    annualBenAmtGen:null,
    annualColaGen:null,
    colaBeginAgeGen:null,
    taxGen:null
  },
  fersPension: {
    active:false,
    benBeginAgeFers:null,
    annualBenAmtFers:null
  },
  annuities: {
    active:false,
    annualAnnuity:null,
    annuityAge:null,
    annuityTax:null
  },
  tradIra: {
    active:false,
    currentValTradIra:null,
    annualContTradIra:null,
    catchUpContTradIra:null,
    contEndAgeTradIra:null,
    investStratTradIra:null
  },
  rothIra: {
    active:false,
    amtContRothIra:null,
    currentValRothIra:null,
    annualContRothIra:null,
    catchUpContRothIra:null,
    contEndAgeRothIra:null,
    investStratRothIra:null
  },
  trad401: {
    active:false,
    currentValTrad401:null,
    empContTrad401:null,
    contEndAgeTrad401:null,
    annualContTrad401:null,
    catchUpContTrad401:null,
    investStratTrad401:null
  },
  roth401: {
    active:false,
    amtContRoth401:null,
    currentValRoth401:null,
    empContRoth401:null,
    contEndAgeRoth401:null,
    annualContRoth401:null,
    catchUpContRoth401:null,
    investStratRoth401:null
  },
  safeHarbor401: {
    active:false,
    currentValSafeHarbor401:null,
    empContSafeHarbor401:null,
    contEndAgeSafeHarbor401:null,
    annualContSafeHarbor401:null,
    catchUpContSafeHarbor401:null,
    investStratSafeHarbor401:null
  },
  single401: {
    active:false,
    currentValSingle401:null,
    empContSingle401:null,
    contEndAgeSingle401:null,
    annualContSingle401:null,
    catchUpContSingle401:null,
    investStratSingle401:null
  },
  trad403: {
    active:false,
    currentValTrad403:null,
    empContTrad403:null,
    contEndAgeTrad403:null,
    annualContTrad403:null,
    catchUpContTrad403:null,
    investStratTrad403:null
  },
  roth403: {
    active:false,
    amtContRoth403:null,
    currentValRoth403:null,
    empContRoth403:null,
    contEndAgeRoth403:null,
    annualContRoth403:null,
    catchUpContRoth403:null,
    investStratRoth403:null
  },
  trad457: {
    active:false,
    currentValTrad457:null,
    empContTrad457:null,
    contEndAgeTrad457:null,
    annualContTrad457:null,
    catchUpContTrad457:null,
    investStratTrad457:null
  },
  roth457: {
    active:false,
    amtContRoth457:null,
    currentValRoth457:null,
    empContRoth457:null,
    contEndAgeRoth457:null,
    annualContRoth457:null,
    catchUpContRoth457:null,
    investStratRoth457:null
  },
  simpleIra: {
    active:false,
    currentValSimpleIra:null,
    empContSimpleIra:null,
    contEndAgeSimpleIra:null,
    annualContSimpleIra:null,
    catchUpContSimpleIra:null,
    contEndAgeSimpleIra:null,
    investStratSimpleIra:null
  },
  simple401: {
    active:false,
    currentValSimple401:null,
    empContSimple401:null,
    contEndAgeSimple401:null,
    annualContSimple401:null,
    catchUpContSimple401:null,
    investStratSimple401:null
  },
  vaDisability: {
    active:false,
    annualAmtVa:null
  },
  ssiDisability: {
    active:false,
    annualAmtSsi:null
  },
  otherDisability: {
    active:false,
    annualAmtOther:null,
    colaOther:null,
    taxOther:null
  },
  investAcct: {
    active:false,
    currentValInv:null,
    contEndAgeInv:null,
    annualContInv:null,
    investStratInv:null
  },
  retireSal: {
    active:false,
    retSalBeginAge:null,
    retSalAmt:null
  },
  rents: {
    active:false,
    rentalProfits:null,
    rentalProfitsGrowth:null
  },
  otherAssets: {
    active:false,
    otherAssets:null,
    otherAssetsTax:null
  },
  otherBen: {
    active:false,
    otherBenAmt:null,
    otherBenCola:null,
    otherBenBeginAge:null,
    otherBenTax:null
  }
};

const states = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];

// SOURCES: https://www.infoplease.com/life-expectancy-birth-race-and-sex-1930-2010
// https://www.cdc.gov/nchs/data/hus/2017/015.pdf https://www.thinkingaheadinstitute.org/en/News/Public/News/2018/12/A-basic-question-about-life-expectancy-that-even-actuaries-struggle-to-answer
const life = {
    stdev:[16,18],1940:[61,65],1941:[61,65],1942:[61,65],1943:[61,65],1944:[61,65],1945:[61,65],1946:[61,65],1947:[61,65],1948:[61,65],1949:[61,65],1950:[66,71],1951:[66,71],1952:[66,71],1953:[66,71],1954:[66,71],1955:[66,71],1956:[66,71],1957:[66,71],1958:[66,71],1959:[66,71],1960:[67,73],1961:[67,73],1962:[67,73],1963:[67,73],1964:[67,73],1965:[67,73],1966:[67,73],1967:[67,73],1968:[67,73],1969:[67,73],1970:[67,75],1971:[67,75],1972:[67,75],1973:[68,75],1974:[68,76],1975:[69,77],1976:[69,77],1977:[70,77],1978:[70,77],1979:[70,78],1980:[70,77],1981:[70,78],1982:[71,78],1983:[71,78],1984:[71,78],1985:[71,78],1986:[71,78],1987:[71,78],1988:[71,78],1989:[72,79],1990:[72,79],1991:[72,79],1992:[72,79],1993:[72,79],1994:[72,79],1995:[73,79],1996:[73,79],1997:[74,79],1998:[74,80],1999:[74,79],2000:[74,80],2001:[74,80],2002:[75,80],2003:[75,80],2004:[75,80],2005:[75,80],2006:[75,80],2007:[75,80],2008:[76,81],2009:[76,81],2010:[76,81],2011:[76,81],2012:[76,81],2013:[76,81],2014:[76,81],2015:[76,81],2016:[76,81],2017:[,],2018:[,],2019:[,],2020:[,]};

export {
    data, life, states};