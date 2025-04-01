import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Switch,
  TextField,
  Slider,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  MusicNote as MusicNoteIcon,
  Edit,
  Save,
  Delete,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API_URL = "http://localhost:1000/audioFiles"; // JSON Server API URL

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1db954",
    },
    background: {
      default: "#121212",
      paper: "#181818",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
});

const MusicPlayer = () => {
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [editingFileId, setEditingFileId] = useState(null);
  const [editName, setEditName] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Fetch audio files from JSON
  useEffect(() => {
    axios.get(API_URL).then((response) => setFiles(response.data));
  }, []);

  // Handle file upload
  const onDrop = (acceptedFiles) => {
    const audioFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("audio/")
    );
    audioFiles.forEach((file) => {
      const newFile = {
        id: Date.now() + file.name,
        name: file.name,
        file: URL.createObjectURL(file),
      };
      axios.post(API_URL, newFile).then(() => {
        setFiles((prev) => [...prev, newFile]);
      });
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "audio/*",
    onDrop,
  });

  // Play or Pause Audio
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Play Next or Previous
  const playNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % files.length);
  };

  const playPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? files.length - 1 : prevIndex - 1
    );
  };

  // Handle song end
  const handleEnded = () => {
    playNext();
  };

  // Use effect to handle autoplay when currentIndex changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // Reload the new audio source
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Autoplay failed: ", err);
        });
      }
    }
  }, [currentIndex, isPlaying]);

  // Update timeline
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (event, newValue) => {
    audioRef.current.currentTime = newValue;
    setCurrentTime(newValue);
  };

  // Start editing a file name
  const startEditing = (id, currentName) => {
    setEditingFileId(id);
    setEditName(currentName);
  };

  // Save edited file name
  const saveEdit = (id) => {
    axios.patch(`${API_URL}/${id}`, { name: editName }).then(() => {
      setFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, name: editName } : file
        )
      );
      setEditingFileId(null);
      setEditName("");
    });
  };
  // Function to handle file deletion
  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`).then(() => {
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box p={3} bgcolor="background.default" sx={{ minHeight: "100vh" }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            background: "linear-gradient(90deg, #1DB954, #A7D477)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
            textTransform: "uppercase",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            letterSpacing: "2px",
          }}
        >
          Musify
        </Typography>

        {/* Drag and Drop */}
        <Box
          {...getRootProps()}
          sx={{
            border: "2px solid #1db954",
            width: "50%",
            margin: "0 auto",
            p: 4,
            mb: 3,
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(29, 185, 84, 0.1)",
              borderColor: "#1db954",
              boxShadow: "0px 4px 10px rgba(29, 185, 84, 0.6)",
            },
          }}
        >
          <input {...getInputProps()} />
          <Box
            sx={{
              width: "60px",
              height: "60px",
              backgroundColor: "#1db954",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: "36px",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              +
            </Typography>
          </Box>
          <Typography
            sx={{
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Click here to upload audio files
          </Typography>
          <Typography
            sx={{
              color: "#b3b3b3",
              fontSize: "14px",
              mt: 1,
            }}
          >
            Upload files or click to browse
          </Typography>
        </Box>

        {/* View Toggle */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          p={2}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography
            sx={{
              color: "#1DB954",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            View Mode:
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              color: "#ffffff",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                color: viewMode === "table" ? "#ffffff" : "#666",
                transition: "color 0.3s",
              }}
            >
              List
            </Typography>
            <Switch
              checked={viewMode === "grid"}
              onChange={() =>
                setViewMode(viewMode === "table" ? "grid" : "table")
              }
              sx={{
                "& .MuiSwitch-track": {
                  backgroundColor: "#1DB954",
                  opacity: 0.7,
                },
                "& .MuiSwitch-thumb": {
                  backgroundColor: "#ffffff",
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "14px",
                color: viewMode === "grid" ? "#ffffff" : "#666",
                transition: "color 0.3s",
              }}
            >
              Box
            </Typography>
          </Box>
        </Box>

        {/* File List */}
        {viewMode === "table" ? (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "background.paper",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow
                    key={file.id}
                    sx={{
                      backgroundColor:
                        index === currentIndex ? "#1DB954" : "background.paper",
                      transition: "background-color 0.3s, transform 0.2s",
                      "&:hover": {
                        backgroundColor:
                          index === currentIndex ? "#17a74a" : "#333333",
                        transform: "scale(1.02)",
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <TableCell
                      sx={{
                        color:
                          index === currentIndex ? "#ffffff" : "text.primary",
                        fontWeight: "bold",
                        fontSize: "16px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {editingFileId === file.id ? (
                        <TextField
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          size="small"
                          fullWidth
                          sx={{
                            "& .MuiInputBase-input": { color: "#ffffff" },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1DB954",
                            },
                          }}
                        />
                      ) : (
                        file.name
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingFileId === file.id ? (
                        <IconButton
                          onClick={() => saveEdit(file.id)}
                          sx={{
                            backgroundColor: "#ffffff",
                            color: "#1DB954",
                            "&:hover": {
                              backgroundColor: "#1DB954",
                              color: "#ffffff",
                            },
                          }}
                        >
                          <Save />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => startEditing(file.id, file.name)}
                          sx={{
                            backgroundColor: "#ffffff",
                            color: "#A7D477",
                            "&:hover": {
                              backgroundColor: "#A7D477",
                              color: "#ffffff",
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleDelete(file.id)}
                        sx={{
                          backgroundColor: "#ffffff",
                          color: "#FF5252",
                          "&:hover": {
                            backgroundColor: "#FF5252",
                            color: "#ffffff",
                          },
                        }}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={3}>
            {files.map((file, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={file.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <Box
                  p={2}
                  sx={{
                    textAlign: "center",
                    backgroundColor:
                      index === currentIndex ? "#1DB954" : "background.paper",
                    borderRadius: "12px",
                    boxShadow:
                      index === currentIndex
                        ? "0px 4px 15px rgba(29, 185, 84, 0.5)"
                        : "0px 2px 8px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                  onClick={() => setCurrentIndex(index)}
                >
                  {/* Large Music Icon */}
                  <MusicNoteIcon
                    sx={{
                      fontSize: 60,
                      color: index === currentIndex ? "#ffffff" : "#1DB954",
                      marginBottom: 2,
                    }}
                  />

                  {/* File Name or Edit Input */}
                  {editingFileId === file.id ? (
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{
                        marginBottom: 1,
                        input: { color: "text.primary" },
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        color:
                          index === currentIndex ? "#ffffff" : "text.primary",
                        fontWeight: "bold",
                        fontSize: "16px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </Typography>
                  )}

                  {/* Action Buttons */}
                  <Box mt={2} display="flex" justifyContent="center" gap={1}>
                    {editingFileId === file.id ? (
                      <IconButton
                        onClick={() => saveEdit(file.id)}
                        sx={{
                          backgroundColor: "#ffffff",
                          color: "#1DB954",
                          "&:hover": {
                            backgroundColor: "#1DB954",
                            color: "#ffffff",
                          },
                        }}
                      >
                        <Save />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => startEditing(file.id, file.name)}
                        sx={{
                          backgroundColor: "#ffffff",
                          color: "#A7D477",
                          "&:hover": {
                            backgroundColor: "#A7D477",
                            color: "#ffffff",
                          },
                        }}
                      >
                        <Edit />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Audio Player */}
        {files.length > 0 && (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              position: "sticky",
              marginTop: 3,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#121212",
              p: 3,
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.5)",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <audio
              ref={audioRef}
              src={files[currentIndex]?.file}
              onEnded={handleEnded}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "60%",
                alignItems: "center",
              }}
            >
              {/* Song Title */}
              <Box mb={1}>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    fontSize: "16px",
                    textAlign: "center",
                  }}
                  noWrap
                >
                  {files[currentIndex]?.name || "No Song Playing"}
                </Typography>
              </Box>

              {/* Controls */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  mb: 1,
                }}
              >
                <IconButton
                  onClick={playPrevious}
                  sx={{
                    color: "#FFFFFF",
                    "&:hover": { color: "#1DB954" },
                  }}
                >
                  <SkipPrevious fontSize="large" />
                </IconButton>
                <IconButton
                  onClick={handlePlayPause}
                  sx={{
                    color: "#FFFFFF",
                    backgroundColor: "#1DB954",
                    p: 1.5,
                    "&:hover": {
                      backgroundColor: "#1ED760",
                    },
                  }}
                >
                  {isPlaying ? (
                    <Pause fontSize="large" />
                  ) : (
                    <PlayArrow fontSize="large" />
                  )}
                </IconButton>
                <IconButton
                  onClick={playNext}
                  sx={{
                    color: "#FFFFFF",
                    "&:hover": { color: "#1DB954" },
                  }}
                >
                  <SkipNext fontSize="large" />
                </IconButton>
              </Box>

              {/* Slider and Timestamps */}
              <Box
                sx={{ width: "100%", display: "flex", alignItems: "center" }}
              >
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "12px",
                  }}
                >
                  {Math.floor(currentTime / 60)}:
                  {("0" + Math.floor(currentTime % 60)).slice(-2)}
                </Typography>
                <Slider
                  value={currentTime}
                  max={duration || 0}
                  onChange={handleSeek}
                  aria-label="Timeline"
                  sx={{
                    color: "#1DB954",
                    mx: 2,
                    height: 6,
                    "& .MuiSlider-thumb": {
                      backgroundColor: "#FFFFFF",
                      "&:hover": { boxShadow: "0 0 10px #1DB954" },
                    },
                    "& .MuiSlider-track": { border: "none" },
                    "& .MuiSlider-rail": {
                      opacity: 0.4,
                      backgroundColor: "#B3B3B3",
                    },
                  }}
                />
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "12px",
                  }}
                >
                  {Math.floor(duration / 60)}:
                  {("0" + Math.floor(duration % 60)).slice(-2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default MusicPlayer;
