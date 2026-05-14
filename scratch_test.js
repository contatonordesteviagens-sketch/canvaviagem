const str = "if (/[A-Za-zÃ€-Ã¿]/.test(value)) return value; vocÃª nÃ£o SÃ³";
try {
  console.log("Original:", str);
  console.log("Fixed with binary->utf8:", Buffer.from(str, 'binary').toString('utf8'));
  
  // What if it's latin1?
  console.log("Fixed with latin1->utf8:", Buffer.from(str, 'latin1').toString('utf8'));
} catch(e) {
  console.error(e);
}
