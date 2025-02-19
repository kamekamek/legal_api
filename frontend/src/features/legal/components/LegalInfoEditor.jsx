import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, MenuItem, Button, Tabs, Tab } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { BuildingRestrictionsEditor } from './BuildingRestrictionsEditor';

const validationSchema = yup.object({
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

const zoneTypes = [
  '第一種低層住居専用地域',
  '第二種低層住居専用地域',
  '第一種中高層住居専用地域',
  '第二種中高層住居専用地域',
  '第一種住居地域',
  '第二種住居地域',
  '準住居地域',
  '近隣商業地域',
  '商業地域',
  '準工業地域',
  '工業地域',
  '工業専用地域',
];

const firePreventionTypes = [
  '防火地域',
  '準防火地域',
  '指定なし',
];

const heightDistricts = [
  '第一種高度地区',
  '第二種高度地区',
  '第三種高度地区',
  '指定なし',
];

const areaClassifications = [
  '市街化区域',
  '市街化調整区域',
  '非線引き都市計画区域',
  '都市計画区域外',
];

export const LegalInfoEditor = ({ initialData, onSave, onCancel }) => {
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [buildingRestrictions, setBuildingRestrictions] = useState(initialData?.buildingRestrictions || {});

  const formik = useFormik({
    initialValues: {
      zoneType: initialData?.zoneType || '',
      firePrevention: initialData?.firePrevention || '',
      coverageRatio: initialData?.coverageRatio || '',
      floorAreaRatio: initialData?.floorAreaRatio || '',
      heightDistrict: initialData?.heightDistrict || '',
      areaClassification: initialData?.areaClassification || '',
      siteArea: initialData?.siteArea || '',
      roadWidth: initialData?.roadWidth || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setCalculating(true);
      try {
        const processedValues = {
          ...values,
          coverageRatio: Number(values.coverageRatio),
          floorAreaRatio: Number(values.floorAreaRatio),
          siteArea: values.siteArea ? Number(values.siteArea) : undefined,
          roadWidth: values.roadWidth ? Number(values.roadWidth) : undefined,
        };
        
        const calculatedValues = await calculateBuildingLimits(processedValues);
        onSave({
          ...processedValues,
          calculations: calculatedValues,
          buildingRestrictions,
        });
      } catch (error) {
        console.error('計算エラー:', error);
      } finally {
        setCalculating(false);
      }
    },
  });

  const calculateBuildingLimits = async (values) => {
    const { siteArea, coverageRatio, floorAreaRatio, roadWidth, zoneType } = values;
    
    // 建築可能面積の計算
    const buildableArea = (siteArea * coverageRatio) / 100;
    
    // 道路幅員による制限値の計算
    const roadWidthLimit = zoneType.includes('住居') 
      ? roadWidth * 0.4 * 100
      : roadWidth * 0.6 * 100;
    
    // 制限値と指定容積率の小さい方を採用
    const effectiveFloorAreaRatio = Math.min(floorAreaRatio, roadWidthLimit);
    const totalFloorArea = (siteArea * effectiveFloorAreaRatio) / 100;

    return {
      buildableArea,
      totalFloorArea,
      roadWidthLimit,
      effectiveFloorAreaRatio,
    };
  };

  const handleBuildingRestrictionsChange = (restrictions) => {
    setBuildingRestrictions(restrictions);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          法令情報編集
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="用途地域情報" />
          <Tab label="建築制限情報" />
        </Tabs>

        {activeTab === 0 && (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="zoneType"
                  label="用途地域"
                  value={formik.values.zoneType}
                  onChange={formik.handleChange}
                  error={formik.touched.zoneType && Boolean(formik.errors.zoneType)}
                  helperText={formik.touched.zoneType && formik.errors.zoneType}
                >
                  {zoneTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="firePrevention"
                  label="防火地域"
                  value={formik.values.firePrevention}
                  onChange={formik.handleChange}
                  error={formik.touched.firePrevention && Boolean(formik.errors.firePrevention)}
                  helperText={formik.touched.firePrevention && formik.errors.firePrevention}
                >
                  {firePreventionTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="coverageRatio"
                  label="建ぺい率 (%)"
                  value={formik.values.coverageRatio}
                  onChange={formik.handleChange}
                  error={formik.touched.coverageRatio && Boolean(formik.errors.coverageRatio)}
                  helperText={formik.touched.coverageRatio && formik.errors.coverageRatio}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="floorAreaRatio"
                  label="容積率 (%)"
                  value={formik.values.floorAreaRatio}
                  onChange={formik.handleChange}
                  error={formik.touched.floorAreaRatio && Boolean(formik.errors.floorAreaRatio)}
                  helperText={formik.touched.floorAreaRatio && formik.errors.floorAreaRatio}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="heightDistrict"
                  label="高度地区"
                  value={formik.values.heightDistrict}
                  onChange={formik.handleChange}
                  error={formik.touched.heightDistrict && Boolean(formik.errors.heightDistrict)}
                  helperText={formik.touched.heightDistrict && formik.errors.heightDistrict}
                >
                  {heightDistricts.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  name="areaClassification"
                  label="区域区分"
                  value={formik.values.areaClassification}
                  onChange={formik.handleChange}
                  error={formik.touched.areaClassification && Boolean(formik.errors.areaClassification)}
                  helperText={formik.touched.areaClassification && formik.errors.areaClassification}
                >
                  {areaClassifications.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="siteArea"
                  label="敷地面積 (㎡)"
                  value={formik.values.siteArea}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="roadWidth"
                  label="前面道路幅員 (m)"
                  value={formik.values.roadWidth}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <BuildingRestrictionsEditor
            initialData={buildingRestrictions}
            onChange={handleBuildingRestrictionsChange}
          />
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel} variant="outlined">
            キャンセル
          </Button>
          <Button
            onClick={formik.handleSubmit}
            variant="contained"
            disabled={calculating}
          >
            {calculating ? '計算中...' : '保存'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 