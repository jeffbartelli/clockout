$(document).ready(function(){

});

window.calcAge = () => {
  let b = data.dob.split(/\D/);
  let c = new Date(b[0], --b[1], b[2]);
  let age = new Date(Date.now() - c).getFullYear()-1970;
  let byear = c.getFullYear();
  let gender;
  let le;
  if(data.hasOwnProperty('gender')) {
    gender = data['gender'];
  }
  if(life.hasOwnProperty(byear)) {
    gender == 'male' ? le = life[byear][0] + life.stdev[0] : le = life[byear][1] + life.stdev[1];
  };
  return {
    current: new Date().getFullYear(),
    age: age,
    retire: data.retAge,
    death: le
  };
}
