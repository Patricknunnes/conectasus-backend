
const validateCPF = (strCPF) => { 
    var Soma;
    var Resto;
    var i;
    
    Soma = 0;
  if (strCPF == "00000000000") return false;

  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

  Soma = 0;
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
};


const cpfOnlyNumbers = (strCPF) => {
  let cpfOnlyNumbers = strCPF.replace(/[^0-9]/g, '');
  cpfOnlyNumbers = cpfOnlyNumbers.padStart(11, "0");
  return cpfOnlyNumbers;
};


const formatCPF = (cpfAtualizado) => {

  if(validateCPF(cpfAtualizado)){
    return cpfAtualizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, 
      function( regex, argumento1, argumento2, argumento3, argumento4 ) {
        return argumento1 + '.' + argumento2 + '.' + argumento3 + '-' + argumento4;
    })  ;
  }
  return cpfAtualizado;

}

export {
    validateCPF ,
    cpfOnlyNumbers,
    formatCPF
};
