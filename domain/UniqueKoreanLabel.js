import crypto from 'crypto';

export const HASH = Object.freeze({
  hashAlgorithm: 'sha256',
  // 한 자리부터 다섯 자리까지 가능한 모든 한글 조합의 총 개수
  // (11172) + (11172)^2 + (11172)^3 + (11172)^4 + (11172)^5
  hashRange: BigInt('174057808174627835892'), 
  hmacKey: 'cat',
});

export const KOREAN_LABEL = Object.freeze({
  totalHangeul: BigInt('11172'), // 11172
  totalHangeul2thPower: BigInt('124813584'), // 11172 ** 2
  totalHangeul3thPower: BigInt('1394417360448'), // 11172 ** 3
  totalHangeul4thPower: BigInt('15578430750925056'), // 11172 ** 4
  totalHangeul5thPower: BigInt('174042228349334725632'), // 11172 ** 5
  totalKoreanLabelOutcomes: BigInt('174057808174627835892'), // (11172) + (11172)^2 + (11172)^3 + (11172)^4 + (11172)^5
  unicodeStart: 0xAC00, // '가' 의 유니코드 값
  unicodeEnd: 0xD7A3, // '힣' 의 유니코드 값
});

// [문자열 숫자를 hashRange 범위로 해시한다. 해시된 문자열 숫자를 반환한다.]
// [input] unique string number
// [output] 0 이상 hashRange-1 이하의 number중 하나를 string number로 반환
export function generateUniqueHashValue(stringNumber) {
  const hmac = crypto.createHmac(HASH.hashAlgorithm, HASH.hmacKey);
  hmac.update(stringNumber);

  const hashValue = hmac.digest('hex');
  const hashInt = BigInt('0x' + hashValue);

  const mappedValue = hashInt % HASH.hashRange;

  return mappedValue.toString();
}

// [0 이상의 bigInt숫자를 받아 '가' 부터 '힣힣힣힣힣' 까지 사전순서로 나열된 hashRange개의 단어중 index에 해당하는 한글을 반환한다]
// [input] 0 이상의 BigInt
// [output] '가' 부터 '힣힣힣힣힣' 사이의 단어중 하나를 문자열로 반환한다.
// generateKoreanOneToFiveChars(BigInt(0)) = '가'
// generateKoreanOneToFiveChars(hashRange - 1) = '힣힣힣힣힣'
export function generateKoreanOneToFiveChars(bigIntIndex) {
  if (bigIntIndex < BigInt(0) || bigIntIndex >= KOREAN_LABEL.totalKoreanLabelOutcomes) {
      throw new Error('유효하지 않은 index 범위 입니다.');
  }

  // output: 1자리 한글
  if (bigIntIndex < KOREAN_LABEL.totalHangeul) {
    const firstChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(bigIntIndex));

    return firstChar;
  }

  // output: 2자리 한글
  bigIntIndex = bigIntIndex - KOREAN_LABEL.totalHangeul;
  if (bigIntIndex < KOREAN_LABEL.totalHangeul2thPower) {
    const firstCharIndex = bigIntIndex / KOREAN_LABEL.totalHangeul;
    const secondCharIndex = bigIntIndex % KOREAN_LABEL.totalHangeul;

    const firstChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(firstCharIndex));
    const secondChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(secondCharIndex));

    return firstChar + secondChar;
  }

  // output: 3자리 한글
  bigIntIndex -= KOREAN_LABEL.totalHangeul2thPower;
  if (bigIntIndex < KOREAN_LABEL.totalHangeul3thPower) {
    const firstCharIndex = bigIntIndex / KOREAN_LABEL.totalHangeul2thPower;
    const secondCharIndex = (bigIntIndex % KOREAN_LABEL.totalHangeul2thPower) / KOREAN_LABEL.totalHangeul;
    const thirdCharIndex = bigIntIndex % KOREAN_LABEL.totalHangeul;

    const firstChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(firstCharIndex));
    const secondChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(secondCharIndex));
    const thirdChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(thirdCharIndex));

    return firstChar + secondChar + thirdChar;
  }

  // output: 4자리 한글
  bigIntIndex -= KOREAN_LABEL.totalHangeul3thPower;
  if (bigIntIndex < KOREAN_LABEL.totalHangeul4thPower) {
    const firstCharIndex = bigIntIndex / KOREAN_LABEL.totalHangeul3thPower;
    const secondCharIndex = (bigIntIndex % KOREAN_LABEL.totalHangeul3thPower) / KOREAN_LABEL.totalHangeul2thPower;
    const thirdCharIndex = (bigIntIndex % KOREAN_LABEL.totalHangeul2thPower) / KOREAN_LABEL.totalHangeul;
    const fourthCharIndex = bigIntIndex % KOREAN_LABEL.totalHangeul;

    const firstChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(firstCharIndex));
    const secondChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(secondCharIndex));
    const thirdChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(thirdCharIndex));
    const fourthChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(fourthCharIndex));

    return firstChar + secondChar + thirdChar + fourthChar;
  }

  // output: 5자리 한글
  bigIntIndex -= KOREAN_LABEL.totalHangeul4thPower;
  const firstCharIndex = bigIntIndex / KOREAN_LABEL.totalHangeul4thPower;
  const secondCharIndex = (bigIntIndex % KOREAN_LABEL.totalHangeul4thPower) / KOREAN_LABEL.totalHangeul3thPower;
  const thirdCharIndex = (bigIntIndex % KOREAN_LABEL.totalHangeul3thPower) / KOREAN_LABEL.totalHangeul2thPower;
  const fourthCharIndex = (bigIntIndex % KOREAN_LABEL.totalHangeul2thPower) / KOREAN_LABEL.totalHangeul;
  const fifthCharIndex = bigIntIndex % KOREAN_LABEL.totalHangeul;

  const firstChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(firstCharIndex));
  const secondChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(secondCharIndex));
  const thirdChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(thirdCharIndex));
  const fourthChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(fourthCharIndex));
  const fifthChar = String.fromCharCode(KOREAN_LABEL.unicodeStart + Number(fifthCharIndex));

  return firstChar + secondChar + thirdChar + fourthChar + fifthChar;
}

/**
 * 한자리 한글이 등장할 학률: 0.00000000642%
 * 다섯자리 한글이 등장할 확률: 99.99% 
 */

const stringNumber = '1004';
const hashedStringNumber  = generateUniqueHashValue(stringNumber);
console.log(`hashedStringNumber: ${hashedStringNumber} , type: ${typeof(hashedStringNumber)}`);

const bigIntIndex = BigInt(hashedStringNumber);
const generatedKorean = generateKoreanOneToFiveChars(bigIntIndex);
console.log(`generatedKorean: ${generatedKorean}`);

