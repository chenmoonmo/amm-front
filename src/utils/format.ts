import BigNumber from "bignumber.js";

export function formatInput(value: string): string {
  let obj = "";
  obj = value.replace(/[^\d.]/g, "");
  obj = obj.replace(/^\./g, "");
  obj = obj.replace(/\.{2,}/g, ".");
  obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  return obj;
}

export const formatAmount = (
  num1: number | string | undefined | null,
  digits?: number,
  isNeedZip = false
): string => {
  if (num1 === undefined || num1 === null || num1 === "") return "-";
  if (isNaN(+num1)) return "-";
  if (+num1 === 0) return "0";

  const decimalBigThanOne = digits ? digits : 4;
  const decimalLessThanOne = digits ? digits : 6;

  let number: string;
  if (+num1 >= 1 || +num1 <= -1) {
    const BN = BigNumber.clone(); //生成一个独立的BigNumber构造函数
    BN.config({ DECIMAL_PLACES: decimalBigThanOne, ROUNDING_MODE: 1 }); //设置小数点、舍入模式
    number = new BN(num1).div(1).toNumber().toString();
    return parseFloat(number).toString();
  } else if (+num1 < 0.0001 && +num1 > 0 && isNeedZip) {
    const BN1 = BigNumber.clone(); //生成一个独立的BigNumber构造函数
    BN1.config({ EXPONENTIAL_AT: 1e9, ROUNDING_MODE: 1 });
    const numStr = new BN1(num1).toString();
    const decimalPart = numStr.split(".")[1];
    const firstNonZeroIndex = decimalPart.search(/[^0]/);
    const fourNumberBehind = decimalPart.slice(
      firstNonZeroIndex,
      firstNonZeroIndex + 4
    );
    number = `0.0(${firstNonZeroIndex})${fourNumberBehind}`;
  } else {
    const BN2 = BigNumber.clone(); //生成一个独立的BigNumber构造函数
    BN2.config({ DECIMAL_PLACES: decimalLessThanOne, ROUNDING_MODE: 1 }); //设置小数点、舍入模式
    number = new BN2(num1).div(1).toNumber().toString();
    return parseFloat(number).toString();
  }
  return number;
};

export const foramtPrecent = (
  num: number | string | undefined | null
): string => {
  return formatAmount(num, 2);
};

export const formatPrice = (
  num: number | string | undefined | null
): string => {
  return formatAmount(num, 4, true);
};
