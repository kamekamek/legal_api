import { useState } from 'react'
import { TextField, Button, Container, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'

// Leafletのデフォルトアイコンの修正
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState(null)
  const [landUseInfo, setLandUseInfo] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    try {
      setError('')
      // ジオコーディング
      const geocodeResponse = await axios.post('http://localhost:3001/api/geocode', { address })
      const coordinates = geocodeResponse.data.features[0].geometry.coordinates
      const newLocation = { lat: coordinates[1], lng: coordinates[0] }
      setLocation(newLocation)

      // 用途地域情報の取得
      const landUseResponse = await axios.get('http://localhost:3001/api/landuse', {
        params: newLocation
      })
      setLandUseInfo(landUseResponse.data)
    } catch (error) {
      setError('検索中にエラーが発生しました。')
      console.error('Search error:', error)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          住所検索
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          住所を入力して地図と用途地域情報を確認できます
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="住所を入力"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ minWidth: '120px' }}
          >
            検索
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          {location && (
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                地図
              </Typography>
              <Box sx={{ height: '300px' }}>
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location.lat, location.lng]} />
                </MapContainer>
              </Box>
            </Paper>
          )}

          {location && (
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                法規制情報
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th">所在地</TableCell>
                      <TableCell>{address}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">用途地域</TableCell>
                      <TableCell>{landUseInfo?.type || '第一種住居地域'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">防火地域</TableCell>
                      <TableCell>{landUseInfo?.fireArea || '準防火地域'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">建蔽率</TableCell>
                      <TableCell>{landUseInfo?.buildingCoverageRatio || '60'}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">容積率</TableCell>
                      <TableCell>{landUseInfo?.floorAreaRatio || '200'}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">建築基準法48条</TableCell>
                      <TableCell>準備中</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th">法別表第２</TableCell>
                      <TableCell>準備中</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  )
}

export default App
