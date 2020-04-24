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
    annuityCola:null,
    annuityAge:null,
    annuityTax:null
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
  retireSal: {
    active:false,
    retSalBeginAge:null,
    retSalEndAge:null,
    retSalAmt:null
  },
  rents: {
    active:false,
    rentalProfits:null,
    rentalProfitsGrowth:null
  },
  otherBen: {
    active:false,
    otherBenAmt:null,
    otherBenCola:null,
    otherBenBeginAge:null,
    otherBenTax:null
  },
  tradIra: {
    active:false,
    currentValTradIra:null,
    annualContTradIra:null,
    catchUpContTradIra:null,
    contEndAgeTradIra:null
  },
  rothIra: {
    active:false,
    amtContRothIra:null,
    currentValRothIra:null,
    annualContRothIra:null,
    catchUpContRothIra:null,
    contEndAgeRothIra:null
  },
  tradAccts: {
    active:false,
    currentValTrad:null,
    empContTrad:null,
    contEndAgeTrad:null,
    annualContTrad:null,
    catchUpContTrad:null
  },
  rothAccts: {
    active:false,
    amtContRoth:null,
    currentValRoth:null,
    empContRoth:null,
    contEndAgeRoth:null,
    annualContRoth:null,
    catchUpContRoth:null
  },
  simpleIra: {
    active:false,
    currentValSimpleIra:null,
    empContSimpleIra:null,
    contEndAgeSimpleIra:null,
    annualContSimpleIra:null,
    catchUpContSimpleIra:null,
    contEndAgeSimpleIra:null
  },
  simple401: {
    active:false,
    currentValSimple401:null,
    empContSimple401:null,
    contEndAgeSimple401:null,
    annualContSimple401:null,
    catchUpContSimple401:null
  },
  investAcct: {
    active:false,
    currentValInv:null,
    contEndAgeInv:null,
    annualContInv:null
  },
  otherAssets: {
    active:false,
    otherAssets:null,
    otherAssetsTax:null
  }
};

const states = [ 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];

// SOURCES: https://www.infoplease.com/life-expectancy-birth-race-and-sex-1930-2010
// https://www.cdc.gov/nchs/data/hus/2017/015.pdf https://www.thinkingaheadinstitute.org/en/News/Public/News/2018/12/A-basic-question-about-life-expectancy-that-even-actuaries-struggle-to-answer
// https://www.actuaries.org.uk/system/files/documents/pdf/longevitybulletin03201205.pdf
const life = {
    stdev:[16,18/*11,13*/],1940:[61,65],1941:[61,65],1942:[61,65],1943:[61,65],1944:[61,65],1945:[61,65],1946:[61,65],1947:[61,65],1948:[61,65],1949:[61,65],1950:[66,71],1951:[66,71],1952:[66,71],1953:[66,71],1954:[66,71],1955:[66,71],1956:[66,71],1957:[66,71],1958:[66,71],1959:[66,71],1960:[67,73],1961:[67,73],1962:[67,73],1963:[67,73],1964:[67,73],1965:[67,73],1966:[67,73],1967:[67,73],1968:[67,73],1969:[67,73],1970:[67,75],1971:[67,75],1972:[67,75],1973:[68,75],1974:[68,76],1975:[69,77],1976:[69,77],1977:[70,77],1978:[70,77],1979:[70,78],1980:[70,77],1981:[70,78],1982:[71,78],1983:[71,78],1984:[71,78],1985:[71,78],1986:[71,78],1987:[71,78],1988:[71,78],1989:[72,79],1990:[72,79],1991:[72,79],1992:[72,79],1993:[72,79],1994:[72,79],1995:[73,79],1996:[73,79],1997:[74,79],1998:[74,80],1999:[74,79],2000:[74,80],2001:[74,80],2002:[75,80],2003:[75,80],2004:[75,80],2005:[75,80],2006:[75,80],2007:[75,80],2008:[76,81],2009:[76,81],2010:[76,81],2011:[76,81],2012:[76,81],2013:[76,81],2014:[76,81],2015:[76,81],2016:[76,81],2017:[76,81],2018:[76,81],2019:[76,81],2020:[76,81],2021:[76,81]};

const rmd = {70:27.4,71:26.5,72:25.6,73:24.7,74:23.8,75:22.9,76:22.0,77:21.2,78:20.3,79:19.5,80:18.7,81:17.9,82:17.1,83:16.3,84:15.5,85:14.8,86:14.1,87:13.4,88:12.7,89:12.0,90:11.4,91:10.8,92:10.2,93:9.6,94:9.1,95:8.6,96:8.1,97:7.6,98:7.1,99:6.7,100:6.3};

// const conservative = {18:4,19:4,20:4,21:4,22:4,23:4,24:4,25:4,26:4,27:4,28:4,29:4,30:4,31:4,32:4,33:4,34:4,35:4,36:4,37:4,38:4,39:4,40:3,41:3,42:3,43:3,44:3,45:3,46:3,47:3,48:3,49:3,50:3,51:3,52:3,53:3,54:3,55:3,56:2,57:2,58:2,59:2,60:2,61:2,62:2,63:2,64:2,65:2,66:1,67:1,68:1,69:1,70:1,71:1,72:1,73:1,74:1,75:1,76:1,77:1,78:1,79:1,80:1,81:1,82:1,83:1,84:1,85:1,86:1,87:1,88:1,89:1,90:1,91:1,92:1,93:1,94:1,95:1,96:1,97:1,98:1,99:1};

const growthRate = {
  under66: 0.0768,
  over65: 0.0322
}

var retire = {
  income: {
    ssi: {
      annual: [],
      tax: []
    },
    genPension: {
      annual: [],
      tax: []
    },
    fersPension: {
      annual: [],
      tax: []
    },
    annuities: {
      annual: [],
      tax: []
    },
    vaDisability: {
      annual: []
    },
    ssiDisability: {
      annual: [],
      tax: []
    },
    otherDisability: {
      annual: [],
      tax: []
    },
    retireSal: {
      annual: [],
      tax: []
    },
    rents: {
      annual: [],
      tax: []
    },
    otherBen: {
      annual: [],
      tax: []
    }
  },
  tradAccts: {
    tradIra: {
      
    },
    trad401: {

    },
    trad403: {

    },
    trad457: {

    },
    safeHarbor401: {

    },
    single401: {

    },
    simpleIra: {

    },
    simple401: {

    }
  },
  invAccts: {
    investAcct: {

    },
    otherAssets: {

    }
  },
  rothAccts: {
    rothIra: {

    },
    roth401: {

    },
    roth403: {

    },
    roth457: {

    }
  }
}

export {data, life, states};