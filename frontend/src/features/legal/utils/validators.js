import * as yup from 'yup';

export const legalInfoValidationSchema = yup.object({
  zoneType: yup.string().required('用途地域は必須です'),
  firePrevention: yup.string().required('防火地域は必須です'),
  coverageRatio: yup
    .number()
    .required('建ぺい率は必須です')
    .min(0, '建ぺい率は0から100の間である必要があります')
    .max(100, '建ぺい率は0から100の間である必要があります')
    .transform((value) => (isNaN(value) ? undefined : Number(value))),
  floorAreaRatio: yup
    .number()
    .required('容積率は必須です')
    .min(0, '容積率は0以上である必要があります')
    .transform((value) => (isNaN(value) ? undefined : Number(value))),
  heightDistrict: yup.string().required('高度地区は必須です'),
  areaClassification: yup.string().required('区域区分は必須です'),
});

export const validateNumberConversion = (values) => {
  const numberValidation = {
    coverageRatio: !isNaN(values.coverageRatio),
    floorAreaRatio: !isNaN(values.floorAreaRatio),
    siteArea: values.siteArea === undefined || !isNaN(values.siteArea),
    roadWidth: values.roadWidth === undefined || !isNaN(values.roadWidth),
  };

  if (Object.values(numberValidation).some(valid => !valid)) {
    throw new Error('数値変換に失敗しました');
  }

  return true;
}; 