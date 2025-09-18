import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography, Box } from "@mui/material";
import CreateRoomPage from "./createRoomPage";
import MusicPlayer from "./MusicPlayer";

export default function Room({ leaveRoomCallback }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState(null);
  const lastSongIdRef = useRef(null);
  const didInitialSyncRef = useRef(false);
  const lastIsPlayingRef = useRef(null);

  const syncGuestPlayback = useCallback(() => {
    if (isHost) return;
    fetch('/spotify/sync', { method: 'POST' })
      .then(r => r.json().catch(() => ({})))
      .then(() => {})
      .catch(() => {});
  }, [isHost]);

  const getRoomDetails = useCallback(() => {
    fetch(`/api/get-room?code=${roomCode}`)
      .then((response) => {
        if (!response.ok) {
          leaveRoomCallback();
          navigate("/", { replace: true });
          return Promise.reject();
        }
        return response.json();
      })
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
      })
      .catch(() => {});
  }, [roomCode, leaveRoomCallback, navigate]);

  const authenticateSpotify = useCallback(() => {
    fetch('/spotify/is-authenticated')
      .then(res => res.json())
      .then(data => {
        setSpotifyAuthenticated(data.status);
        if (!data.status) {
          fetch('/spotify/get-auth-url')
            .then(r => r.json())
            .then(d => {
              if (d.url) window.location.replace(d.url);
            });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getRoomDetails();
  }, [getRoomDetails]);

  useEffect(() => {
    if (isHost) authenticateSpotify();
  }, [isHost, authenticateSpotify]);

  const leaveButtonPressed = () => {
    fetch("/api/leave-room", { method: "POST" })
      .then(() => {
        leaveRoomCallback();
        navigate("/", { replace: true });
      })
      .catch(() => {});
  };

  const updateAfterChange = () => {
    getRoomDetails();
  };

  const getCurrentSong = useCallback(() => {
    fetch('/spotify/current-song')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data) {
          setSong(data);
          if (!isHost) {
            const currentId = data.id;
            const hostIsPlaying = data.is_playing;
            const prevId = lastSongIdRef.current;
            const prevPlaying = lastIsPlayingRef.current;

            if (!didInitialSyncRef.current && currentId) {
              syncGuestPlayback();
              didInitialSyncRef.current = true;
            } else {
              if (currentId && prevId && currentId !== prevId) {
                syncGuestPlayback();
              }
              if (prevPlaying !== null && prevPlaying !== hostIsPlaying) {
                syncGuestPlayback();
              }
            }
            lastSongIdRef.current = currentId;
            lastIsPlayingRef.current = hostIsPlaying;
          }
        }
      })
      .catch(() => {});
  }, [isHost, syncGuestPlayback]);

  useEffect(() => {
    // Poll song every second
    const interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval);
  }, [getCurrentSong]);

  const settingsView = (
    <Box sx={{ width: '100%', p: 2 }}>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update
            votesToSkip={votesToSkip}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={updateAfterChange}
          />
        </Grid>
        <Grid item xs={12} align="center" sx={{ mt: -14 }}>
          <Button variant="contained" color="secondary" onClick={() => setShowSettings(false)}>
            Close
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  if (showSettings) return settingsView;

  return (
    <Grid container direction="column" alignItems="center" justifyContent="flex-start" sx={{ minHeight: '100vh', py: 2 }}>
      <Grid item xs={12} sx={{ width: '100%', maxWidth: 600, flexGrow: 1 }}>
        <Box sx={{ maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', px: 2 }}>
          <Grid container spacing={2} direction="column" alignItems="center">
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">Code: {roomCode}</Typography>
      </Grid>
      <Grid item xs={12} align="center" sx={{ width: '100%' }}>
        {song ? (
          <MusicPlayer
            {...song}
            votes_required={votesToSkip}
            votes={song.votes ?? 0}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">No song playing</Typography>
        )}
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">Votes: {votesToSkip}</Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">Guest Can Pause: {guestCanPause.toString()}</Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">Host: {isHost.toString()}</Typography>
      </Grid>
      {isHost && (
        <Grid item xs={12} align="center">
          <Typography variant="body1" color={spotifyAuthenticated ? 'success.main' : 'error.main'}>
            Spotify: {spotifyAuthenticated ? 'Authenticated' : 'Authenticating...'}
          </Typography>
        </Grid>
      )}
      {isHost && (
        <Grid item xs={12} align="center">
          <Button variant="contained" color="primary" onClick={() => setShowSettings(true)}>Settings</Button>
        </Grid>
      )}
      <Grid item xs={12} align="center">
        <Button variant="contained" color="secondary" onClick={leaveButtonPressed}>Leave Room</Button>
      </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}