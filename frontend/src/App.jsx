import { useState } from 'react'
import { TextField, IconButton, Container, Box, Typography, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
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
    <Box sx={{ 
      bgcolor: '#F5F5F5', 
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            住所検索
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            住所を入力して地図と用途地域情報を確認できます
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            maxWidth: 600,
            mx: 'auto',
            bgcolor: 'white',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 1
          }}>
            <TextField
              fullWidth
              placeholder="住所を入力"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
                '& .MuiInputBase-input': {
                  p: 2,
                }
              }}
            />
            <IconButton 
              onClick={handleSearch}
              sx={{ 
                bgcolor: '#1a237e',
                borderRadius: 1,
                color: 'white',
                m: 1,
                '&:hover': {
                  bgcolor: '#000051'
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {location && (
          <Paper 
            elevation={3}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: 'white'
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {/* 地図 */}
                <Box sx={{ flex: '1 1 400px', minHeight: 300 }}>
                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={16}
                    style={{ height: '100%', width: '100%', minHeight: 300 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[location.lat, location.lng]} />
                  </MapContainer>
                </Box>

                {/* 法規制情報 */}
                <Box sx={{ flex: '1 1 400px' }}>
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <InfoRow label="所在地" value={address} />
                    <InfoRow label="用途地域" value={landUseInfo?.type || '第一種住居地域'} />
                    <InfoRow label="防火地域" value={landUseInfo?.fireArea || '準防火地域'} />
                    <InfoRow label="建蔽率" value={`${landUseInfo?.buildingCoverageRatio || '60'}%`} />
                    <InfoRow label="容積率" value={`${landUseInfo?.floorAreaRatio || '200'}%`} />
                    <InfoRow label="建築基準法48条" value="準備中" />
                    <InfoRow label="法別表第２" value="準備中" />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

// 情報行のコンポーネント
function InfoRow({ label, value }) {
  return (
    <Box sx={{ 
      display: 'flex',
      borderBottom: '1px solid #eee',
      py: 2
    }}>
      <Typography sx={{ 
        width: 120,
        color: 'text.secondary',
        fontWeight: 500
      }}>
        {label}
      </Typography>
      <Typography sx={{ flex: 1 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default App
