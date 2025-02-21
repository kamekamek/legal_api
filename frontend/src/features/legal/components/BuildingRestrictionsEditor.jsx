import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  law48: yup.object({
    allowedUses: yup.array().of(yup.string()).min(1, '建築可能用途を1つ以上選択してください'),
  }),
  lawAppendix2: yup.object({
    category: yup.string().required('区分を選択してください'),
  }),
});

// 建築基準法48条に基づく用途制限
const buildingUses = [
  '住宅',
  '共同住宅',
  '事務所',
  '店舗',
  '飲食店',
  '工場',
  '倉庫',
  '学校',
  '病院',
  'ホテル',
  '劇場',
  '集会場',
];

// 法別表第2の区分
const appendixCategories = [
  '第一種',
  '第二種',
  '第三種',
  '第四種',
  '第五種',
];

export const BuildingRestrictionsEditor = ({ initialData, onChange }) => {
  const formik = useFormik({
    initialValues: {
      law48: {
        allowedUses: initialData?.law48?.allowedUses || [],
        restrictions: initialData?.law48?.restrictions || '',
      },
      lawAppendix2: {
        category: initialData?.lawAppendix2?.category || '',
        restrictions: initialData?.lawAppendix2?.restrictions || '',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

  const handleUsesChange = (use) => {
    const currentUses = formik.values.law48.allowedUses;
    const newUses = currentUses.includes(use)
      ? currentUses.filter(u => u !== use)
      : [...currentUses, use];
    
    formik.setFieldValue('law48.allowedUses', newUses);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        建築制限情報
      </Typography>

      <Grid container spacing={3}>
        {/* 建築基準法48条関連 */}
        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">
              建築基準法48条に基づく建築可能用途
            </FormLabel>
            <FormGroup>
              <Grid container spacing={2}>
                {buildingUses.map((use) => (
                  <Grid item xs={6} sm={4} key={use}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.law48.allowedUses.includes(use)}
                          onChange={() => handleUsesChange(use)}
                        />
                      }
                      label={use}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            name="law48.restrictions"
            label="その他の制限事項"
            value={formik.values.law48.restrictions}
            onChange={formik.handleChange}
          />
        </Grid>

        {/* 法別表第2関連 */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            法別表第2による制限
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                name="lawAppendix2.category"
                label="区分"
                value={formik.values.lawAppendix2.category}
                onChange={formik.handleChange}
                error={
                  formik.touched.lawAppendix2?.category &&
                  Boolean(formik.errors.lawAppendix2?.category)
                }
                helperText={
                  formik.touched.lawAppendix2?.category &&
                  formik.errors.lawAppendix2?.category
                }
              >
                {appendixCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="lawAppendix2.restrictions"
                label="制限事項"
                value={formik.values.lawAppendix2.restrictions}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}; 