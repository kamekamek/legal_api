import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
  Grid,
  Skeleton,
  TextField,
  MenuItem,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import LegalInfo from '../legal/LegalInfo';
import {
  YOUTO_MAPPING,
  BOUKA_MAPPING,
  ZONE_DIVISION_MAPPING
} from '../legal/constants/zoneTypes';
import { parseHeightDistrict, parseScenicDistrict } from '../legal/utils/zoneUtils';
import KokujiDialog from '../legal/components/KokujiDialog';
import CloseIcon from '@mui/icons-material/Close';
import BuildingCalculator from '../legal/BuildingCalculator';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openLegalEditDialog, setOpenLegalEditDialog] = useState(false);
  const [legalInfo, setLegalInfo] = useState(null);
  const [openKokujiDialog, setOpenKokujiDialog] = useState(false);
  const [selectedKokujiId, setSelectedKokujiId] = useState(null);
  const [kokujiList, setKokujiList] = useState([]);

  // 条文表示用のダイアログを追加
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    content: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/projects/${id}`);
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました');
        }
        const data = await response.json();
        setProject(data);

        // 法令情報を取得
        const legalResponse = await fetch(`http://localhost:3001/api/v1/projects/${id}/legal-info`);
        if (legalResponse.ok) {
          const legalData = await legalResponse.json();
          if (legalData.status === 'success' && legalData.data) {
            setLegalInfo(legalData.data);
          }
        }

        // 告示文一覧を取得
        try {
          const kokujiResponse = await fetch(`http://localhost:3001/api/v1/projects/${id}/kokuji`);
          if (kokujiResponse.ok) {
            const kokujiData = await kokujiResponse.json();
            setKokujiList(kokujiData.data);
          } else {
            console.warn('告示文一覧の取得に失敗しました:', await kokujiResponse.text());
            setKokujiList([]);  // 空の配列をセット
          }
        } catch (error) {
          console.error('告示文一覧取得エラー:', error);
          setKokujiList([]);  // エラー時は空の配列をセット
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('プロジェクトの削除に失敗しました');
      }
      navigate('/projects');
    } catch (error) {
      setError(error.message);
    }
    setOpenDeleteDialog(false);
  };

  const handleLegalInfoUpdate = async (updatedInfo) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/legal/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInfo),
      });

      if (!response.ok) {
        throw new Error('法令情報の更新に失敗しました');
      }

      const updatedData = await response.json();
      setLegalInfo(updatedData);
      setProject(prev => ({ ...prev, legalInfo: updatedData }));
      setOpenLegalEditDialog(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || '法令情報の更新に失敗しました');
    }
  };

  const handleAddressSearch = async () => {
    if (!project?.location) {
      setError('住所が設定されていません');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/legal/zone/info?address=${encodeURIComponent(project.location)}`);
      if (!response.ok) {
        throw new Error('用途地域情報の取得に失敗しました');
      }

      const zoneInfo = await response.json();
      await handleLegalInfoUpdate(zoneInfo);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || '用途地域情報の取得に失敗しました');
    }
  };

  const handleKokujiClick = (kokujiId) => {
    setSelectedKokujiId(kokujiId);
    setOpenKokujiDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'planning':
        return '計画中';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  const renderLegalInfo = () => {
    if (!legalInfo) return '未取得';

    const InfoRow = ({ label, value, button }) => (
      <Box sx={{
        display: 'flex',
        borderBottom: '1px solid #eee',
        py: 2,
        '&:last-child': {
          borderBottom: 'none'
        }
      }}>
        <Typography
          component="div"
          sx={{
            width: '30%',
            color: 'text.secondary',
            fontWeight: 'normal'
          }}
        >
          {label}
        </Typography>
        <Box sx={{
          width: '70%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography component="div">
            {value || '−'}
          </Typography>
          {button && (
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={button.onClick}
              sx={{ ml: 2 }}
            >
              {button.label}
            </Button>
          )}
        </Box>
      </Box>
    );

    return (
      <Box sx={{ width: '100%' }}>
        <InfoRow label="所在地" value={project?.location} />
        <InfoRow label="用途地域" value={legalInfo.type ? YOUTO_MAPPING[legalInfo.type] : '−'} />
        <InfoRow label="防火地域" value={legalInfo.fireArea ? BOUKA_MAPPING[legalInfo.fireArea] : '−'} />
        <InfoRow label="建蔽率" value={legalInfo.buildingCoverageRatio ? `${legalInfo.buildingCoverageRatio}%` : '−'} />
        <InfoRow label="建蔽率（制限値）" value={legalInfo.buildingCoverageRatio2 ? `${legalInfo.buildingCoverageRatio2}%` : '−'} />
        <InfoRow label="容積率" value={legalInfo.floorAreaRatio ? `${legalInfo.floorAreaRatio}%` : '−'} />
        <InfoRow label="高度地区" value={(() => {
          if (!legalInfo.heightDistrict) return '−';
          const height = parseHeightDistrict(legalInfo.heightDistrict);
          if (!height) return '−';
          return height.join('\n');
        })()} />
        <InfoRow label="高度地区（制限値）" value={(() => {
          if (!legalInfo.heightDistrict2) return '−';
          const height = parseHeightDistrict(legalInfo.heightDistrict2);
          if (!height) return '−';
          return height.join('\n');
        })()} />
        <InfoRow label="区域区分" value={(() => {
          if (!legalInfo.zoneMap) return '−';
          const parts = legalInfo.zoneMap.split(':');
          return ZONE_DIVISION_MAPPING[parts[0]] || '−';
        })()} />
        <InfoRow label="風致地区" value={(() => {
          const scenic = parseScenicDistrict(legalInfo.scenicZoneName, legalInfo.scenicZoneType);
          if (!scenic) return '−';
          return [
            scenic.name,
            scenic.type && `第${scenic.type}種`
          ].filter(Boolean).join(' ');
        })()} />
        <InfoRow 
          label="建築基準法48条" 
          value="準備中"
          button={{ 
            label: '条文を表示', 
            onClick: () => handleOpenDialog('建築基準法48条', legalInfo.article48 || '準備中') 
          }}
        />
        <InfoRow 
          label="法別表第2" 
          value="準備中"
          button={{ 
            label: '条文を表示', 
            onClick: () => handleOpenDialog('法別表第2', legalInfo.appendix2 || '準備中') 
          }}
        />
        <InfoRow 
          label="告示文" 
          value={kokujiList.length > 0 ? `${kokujiList.length}件の告示文があります` : '関連する告示文はありません'}
          button={{ 
            label: '告示文を表示', 
            onClick: () => setOpenKokujiDialog(true) 
          }}
        />
        <InfoRow label="東京都建築安全条例" value="準備中" />
      </Box>
    );
  };

  // 条文表示用のダイアログを追加
  const handleOpenDialog = (title, content) => {
    setDialogState({
      open: true,
      title,
      content
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      title: '',
      content: ''
    });
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 4 } }}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography>プロジェクトが見つかりませんでした。</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* プロジェクト基本情報 */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h4" component="h1">
                  {project.name}
                </Typography>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={getStatusColor(project.status)}
                  sx={{ fontSize: '1rem' }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                所在地
              </Typography>
              <Typography variant="body1">
                {project.location || '未設定'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                期間
              </Typography>
              <Typography variant="body1">
                {project.start_date ? `${project.start_date} 〜 ${project.end_date || '未定'}` : '未設定'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                説明
              </Typography>
              <Typography variant="body1" paragraph>
                {project.description || '説明はありません'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/projects/${id}/edit`)}
                >
                  編集
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  削除
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 法令情報セクション */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h5" component="h2">
              法令情報
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={() => navigate(`/map-search/${id}`)}
              >
                用途地域検索
              </Button>
            </Box>
          </Box>

          {renderLegalInfo()}
        </Paper>

        {/* 建築計算機能 */}
        {project && legalInfo && (
          <BuildingCalculator 
            projectId={project.id} 
            legalInfo={legalInfo}
          />
        )}
      </Box>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          プロジェクトを削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            この操作は取り消すことができません。本当にプロジェクトを削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openLegalEditDialog}
        onClose={() => setOpenLegalEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>法令情報の編集</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="用途地域"
                  value={legalInfo?.zoneMap || ''}
                  onChange={(e) => setLegalInfo(prev => ({ ...prev, zoneMap: e.target.value }))}
                >
                  <MenuItem value="第一種低層住居専用地域">第一種低層住居専用地域</MenuItem>
                  <MenuItem value="第一種中高層住居専用地域">第一種中高層住居専用地域</MenuItem>
                  <MenuItem value="第一種住居地域">第一種住居地域</MenuItem>
                  <MenuItem value="近隣商業地域">近隣商業地域</MenuItem>
                  <MenuItem value="商業地域">商業地域</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="高度地区"
                  value={legalInfo?.heightDistrict || ''}
                  onChange={(e) => setLegalInfo(prev => ({ ...prev, heightDistrict: e.target.value }))}
                >
                  <MenuItem value="第一種高度地区">第一種高度地区</MenuItem>
                  <MenuItem value="第二種高度地区">第二種高度地区</MenuItem>
                  <MenuItem value="第三種高度地区">第三種高度地区</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLegalEditDialog(false)}>
            キャンセル
          </Button>
          <Button onClick={() => handleLegalInfoUpdate(legalInfo)} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 告示文一覧ダイアログ */}
      <Dialog
        open={openKokujiDialog}
        onClose={() => setOpenKokujiDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle>
          告示文一覧
          <IconButton
            aria-label="close"
            onClick={() => setOpenKokujiDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {kokujiList.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {kokujiList.map((kokuji) => (
                <Paper
                  key={kokuji.kokuji_id}
                  elevation={1}
                  sx={{ p: 2 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {kokuji.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        告示ID: {kokuji.kokuji_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        施行日: {kokuji.effective_date}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleKokujiClick(kokuji.kokuji_id)}
                    >
                      詳細を表示
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography sx={{ p: 2 }}>
              関連する告示文はありません
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* 告示文詳細ダイアログ */}
      <KokujiDialog
        kokujiId={selectedKokujiId}
        open={openKokujiDialog && selectedKokujiId !== null}
        onClose={() => {
          setSelectedKokujiId(null);
          setOpenKokujiDialog(false);
        }}
      />

      {/* 条文表示ダイアログ */}
      <Dialog
        open={dialogState.open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle>
          {dialogState.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            fontFamily: 'serif',
            fontSize: '1.1rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            padding: 2
          }}>
            {dialogState.content}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 