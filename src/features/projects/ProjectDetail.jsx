<Box sx={{ mt: 3 }}>
  <Typography variant="h5" gutterBottom>
    法令情報
  </Typography>
  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
    <Button
      variant="contained"
      color="primary"
      onClick={handleAddressSearch}
      data-testid="address-search-button"
      aria-label="住所から取得"
    >
      住所から取得
    </Button>
    <Button
      variant="contained"
      color="primary"
      onClick={handleMapSearch}
      data-testid="map-search-button"
      aria-label="地図から検索"
    >
      地図から検索
    </Button>
  </Box>
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddressSearch}
        >
          住所から取得
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleMapSearch}
        >
          地図から検索
        </Button>
      </Box>
      <Typography variant="subtitle2" gutterBottom>
        用途地域
      </Typography>
      <Typography variant="body1" paragraph>
        {legalInfo?.zoneType || '未設定'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        建ぺい率
      </Typography>
      <Typography variant="body1" paragraph>
        {legalInfo?.buildingCoverageRatio || '未設定'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        容積率
      </Typography>
      <Typography variant="body1" paragraph>
        {legalInfo?.floorAreaRatio || '未設定'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        高度地区
      </Typography>
      <Typography variant="body1" paragraph>
        {legalInfo?.heightDistrict || '未設定'}
      </Typography>
    </Grid>
  </Grid>
</Box> 