

const cnsOnlyNumbers = (cns) => {
  return  cns.replace(/[^0-9]/g, '').padStart(15, "0");
};

export default cnsOnlyNumbers;