import esrever from 'esrever';

export function encryptText(msg, encryptionkey) {
  let cipher = reverseKey(msg) + encryptionkey;
  const seq = sequenceGenerator(encryptionkey.length);
  for (let i = 0; i < seq.length; i++) {
    const v = seq[i];
    cipher = cipherText(cipher, v);
  }
  return cipher;
}

export function decryptText(cipher, encryptionkey) {
  const seq = sequenceGenerator(encryptionkey.length);
  for (let i = 0; i < seq.length; i++) {
    const v = seq[i];
    cipher = decipherText(cipher, v);
  }
  cipher = cipher.replace(encryptionkey, '');
  cipher = reverseKey(cipher);
  return cipher;
}

function reverseKey(x) {
  return esrever.reverse(x);
}

function cipherText(x, val) {
  for (let i = 0; i < x.length; i++) {
    let z = x.charCodeAt(i);
    z = String.fromCharCode(z + val);
    x = x.replaceAt(i, z);
  }
  return x;
}

function decipherText(x, val) {
  for (let i = 0; i < x.length; i++) {
    let z = x.charCodeAt(i);
    z = String.fromCharCode(z - val);
    x = x.replaceAt(i, z);
  }
  return x;
}

function sequenceGenerator(length) {
  var a = 1,
    b = 0,
    temp;
  const series = [];
  while (length > 0) {
    temp = a;
    a = a + b;
    b = temp;
    length--;
    series.push(b);
  }
  return series;
}

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

export const PRIVATE_KEY =
  'ALeK3-5i535jtmvom=3@#@#$#@ ,2pck-r04rcr40= v0=442=2v =r--r';
