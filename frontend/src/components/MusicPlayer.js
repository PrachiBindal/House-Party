import React, { useCallback } from 'react';
import { Card, Grid, Typography, IconButton, LinearProgress, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';

// Props: title, artist, image_url, is_playing, time, duration
export default function MusicPlayer({
  title,
  artist,
  image_url,
  is_playing,
  time,
  duration,
  votes,
  votes_required,
}) {
  const progress = duration ? Math.min(100, (time / duration) * 100) : 0;
  
  const pauseSong = useCallback(() => {
    fetch('/spotify/pause', { method: 'PUT' }).catch(() => {});
  }, []);

  const playSong = useCallback(() => {
    fetch('/spotify/play', { method: 'PUT' }).catch(() => {});
  }, []);

  const skipSong = useCallback(() => {
    fetch('/spotify/skip', { method: 'POST', headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  }, []);


  return (
    <Card sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
      <Grid container alignItems="center" wrap="nowrap">
        <Grid item xs="auto">
          <Box sx={{ width: { xs: 96, sm: 120 }, height: { xs: 96, sm: 120 }, m: 1, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
            {image_url && (
              <img
                src={image_url}
                alt={title || 'Album Art'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </Box>
        </Grid>
        <Grid item xs>
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography component="h5" variant="subtitle1" noWrap>{title || 'Unknown Title'}</Typography>
            <Typography color="text.secondary" variant="caption" noWrap>{artist || 'Unknown Artist'}</Typography>
            <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" onClick={is_playing ? pauseSong : playSong} aria-label={is_playing ? 'Pause' : 'Play'}>
                {is_playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </IconButton>
              {/* {typeof votes_required !== 'undefined' && ( */}
                <IconButton size="small" onClick={skipSong} aria-label="Skip Song">
                  <Typography variant="caption" sx={{ mr: 0.5 }}>
                    {(votes ?? 0)} / {(votes_required ?? 0)}
                  </Typography>
                  <SkipNextIcon fontSize="small" />
                </IconButton>
              {/* )} */}
            </Box>
          </Box>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
    </Card>
  );
}
