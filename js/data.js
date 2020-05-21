const data = {
  demographics: {
    dob:null,
    gender:null,
    salary:null,
    retSal:null,
    retAge:null,
    married:null,
    retState:null
  },
  ssi: {
    active:true,
    beginAge_ssi:null,
    annAmt_ssi:null
  },
  genPension: {
    active:false,
    beginAge_genPension:null,
    annAmt_genPension:null,
    colaRate_genPension:null,
    colaAge_genPension:null,
    tax_genPension:null
  },
  fersPension: {
    active:false,
    beginAge_fersPension:null,
    annAmt_fersPension:null
  },
  annuities: {
    active:false,
    annAmt_annuities:null,
    colaRate_annuities:null,
    beginAge_annuities:null,
    tax_annuities:null
  },
  vaDisability: {
    active:false,
    annAmt_vaDisability:null
  },
  ssiDisability: {
    active:false,
    annAmt_ssiDisability:null
  },
  otherDisability: {
    active:false,
    annAmt_otherDisability:null,
    colaRate_otherDisability:null,
    tax_otherDisability:null
  },
  retireSal: {
    active:false,
    beginAge_retireSal:null,
    endAge_retireSal:null,
    annAmt_retireSal:null
  },
  rents: {
    active:false,
    annAmt_rents:null,
    colaRate_rents:null
  },
  otherBen: {
    active:false,
    annAmt_otherBen:null,
    colaRate_otherBen:null,
    otherBenBeginAge:null,
    otherBenTax:null
  },
  tradIra: {
    active:false,
    currentVal_tradIra:null,
    annContr_tradIra:null,
    catchUpContr_tradIra:null,
    endAgeContr_tradIra:null
  },
  rothIra: {
    active:false,
    contrVal_rothIra:null,
    currentVal_rothIra:null,
    annContr_rothIra:null,
    catchUpContr_rothIra:null,
    endAgeContr_rothIra:null
  },
  tradAccts: {
    active:false,
    currentVal_tradAccts:null,
    empContr_tradAccts:null,
    endAgeContr_tradAccts:null,
    annContr_tradAccts:null,
    catchUpContr_tradAccts:null
  },
  rothAccts: {
    active:false,
    contrVal_rothAccts:null,
    currentVal_rothAccts:null,
    empContr_rothAccts:null,
    endAgeContr_rothAccts:null,
    annContr_rothAccts:null,
    catchUpContr_rothAccts:null
  },
  simpleIra: {
    active:false,
    currentVal_simpleIra:null,
    empContr_simpleIra:null,
    endAgeContr_simpleIra:null,
    annContr_simpleIra:null,
    catchUpContr_simpleIra:null
  },
  simple401: {
    active:false,
    currentVal_simple401:null,
    empContr_simple401:null,
    endAgeContr_simple401:null,
    annContr_simple401:null,
    catchUpContr_simple401:null
  },
  investAcct: {
    active:false,
    currentVal_investAcct:null,
    endAgeContr_investAcct:null,
    annContr_investAcct:null
  },
  // otherAssets: {
  //   active:false,
  //   otherAssets:null,
  //   otherAssetsTax:null
  // }
};



// SOURCES: https://www.infoplease.com/life-expectancy-birth-race-and-sex-1930-2010
// https://www.cdc.gov/nchs/data/hus/2017/015.pdf https://www.thinkingaheadinstitute.org/en/News/Public/News/2018/12/A-basic-question-about-life-expectancy-that-even-actuaries-struggle-to-answer
// https://www.actuaries.org.uk/system/files/documents/pdf/longevitybulletin03201205.pdf
const life = {
    stdev:[16,18/*11,13*/],1940:[61,65],1941:[61,65],1942:[61,65],1943:[61,65],1944:[61,65],1945:[61,65],1946:[61,65],1947:[61,65],1948:[61,65],1949:[61,65],1950:[66,71],1951:[66,71],1952:[66,71],1953:[66,71],1954:[66,71],1955:[66,71],1956:[66,71],1957:[66,71],1958:[66,71],1959:[66,71],1960:[67,73],1961:[67,73],1962:[67,73],1963:[67,73],1964:[67,73],1965:[67,73],1966:[67,73],1967:[67,73],1968:[67,73],1969:[67,73],1970:[67,75],1971:[67,75],1972:[67,75],1973:[68,75],1974:[68,76],1975:[69,77],1976:[69,77],1977:[70,77],1978:[70,77],1979:[70,78],1980:[70,77],1981:[70,78],1982:[71,78],1983:[71,78],1984:[71,78],1985:[71,78],1986:[71,78],1987:[71,78],1988:[71,78],1989:[72,79],1990:[72,79],1991:[72,79],1992:[72,79],1993:[72,79],1994:[72,79],1995:[73,79],1996:[73,79],1997:[74,79],1998:[74,80],1999:[74,79],2000:[74,80],2001:[74,80],2002:[75,80],2003:[75,80],2004:[75,80],2005:[75,80],2006:[75,80],2007:[75,80],2008:[76,81],2009:[76,81],2010:[76,81],2011:[76,81],2012:[76,81],2013:[76,81],2014:[76,81],2015:[76,81],2016:[76,81],2017:[76,81],2018:[76,81],2019:[76,81],2020:[76,81],2021:[76,81]};

const rmd = {70:27.4,71:26.5,72:25.6,73:24.7,74:23.8,75:22.9,76:22.0,77:21.2,78:20.3,79:19.5,80:18.7,81:17.9,82:17.1,83:16.3,84:15.5,85:14.8,86:14.1,87:13.4,88:12.7,89:12.0,90:11.4,91:10.8,92:10.2,93:9.6,94:9.1,95:8.6,96:8.1,97:7.6,98:7.1,99:6.7,100:6.3};

const growthRate = {
  sp500: 0.0768,
  ssi: 0.023,
  vaDisability: 0.023,
  fers: 0.018,
  inflation: 0.0322
}

export {data, life, growthRate, rmd};