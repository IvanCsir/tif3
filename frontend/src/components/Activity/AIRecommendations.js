import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Container,
  Snackbar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import HomeIcon from "@mui/icons-material/Home";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CloseIcon from "@mui/icons-material/Close";
import API_BASE_URL from "../../config/api";

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [provider, setProvider] = useState("fallback");
  const [reservingSlot, setReservingSlot] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) {
        setError("Debes iniciar sesión para ver recomendaciones");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/ai-recommendations/get_recommendations/?user_id=${encodeURIComponent(usuarioId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 404) {
          setError(errData.message || "Debes iniciar sesión para ver recomendaciones");
          return;
        }
        throw new Error(errData.error || errData.message || "Error al obtener recomendaciones");
      }

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations || []);
        setHasHistory(data.has_history || false);
        setUsedAI(Boolean(data.used_ai));
        setProvider(data.provider || (data.used_ai ? "gemini" : "fallback"));
      } else {
        setError(data.message || "No se pudieron cargar las recomendaciones");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Error al cargar las recomendaciones. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewActivity = (activityId) => {
    navigate(`/activity/lugares_disponibles/${activityId}/`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleReserveSlot = async (activityId, datosActivityId, activityName) => {
    try {
      setReservingSlot(datosActivityId);

      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) {
        setSnackbar({
          open: true,
          message: "Debes iniciar sesión para reservar",
          severity: "error",
        });
        setReservingSlot(null);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/activities/activity/${activityId}/reservar/${datosActivityId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario: usuarioId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Actualizar capacidad localmente sin recargar toda la página
        setRecommendations((prevRecs) =>
          prevRecs.map((rec) => ({
            ...rec,
            horarios_disponibles: rec.horarios_disponibles.map((horario) =>
              horario.id === datosActivityId
                ? { ...horario, capacidad: horario.capacidad - 1 }
                : horario
            ),
          }))
        );

        setSnackbar({
          open: true,
          message: `¡Reserva confirmada para ${activityName}!`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Error al realizar la reserva",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error making reservation:", err);
      setSnackbar({
        open: true,
        message: "Error al realizar la reserva. Intenta de nuevo.",
        severity: "error",
      });
    } finally {
      setReservingSlot(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Generando recomendaciones personalizadas...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: "2rem", color: "#1976d2" }} />
          Recomendaciones para ti
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {hasHistory
            ? "Basadas en tu historial de actividades"
            : "Actividades sugeridas para comenzar"}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Chip
            label={usedAI ? "IA: Gemini" : "Fallback sin IA"}
            color={usedAI ? "primary" : "default"}
            size="small"
          />
          {provider && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              origen: {provider}
            </Typography>
          )}
        </Box>
      </Box>

      {recommendations.length === 0 ? (
        <Alert severity="info">
          No hay actividades disponibles en este momento. Vuelve más tarde.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} md={4} key={rec.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {rec.nombre}
                    </Typography>
                    <Chip
                      icon={
                        rec.aire_libre ? (
                          <OutdoorGrillIcon />
                        ) : (
                          <HomeIcon />
                        )
                      }
                      label={rec.aire_libre ? "Al aire libre" : "Bajo techo"}
                      size="small"
                      color={rec.aire_libre ? "success" : "primary"}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {rec.descripcion}
                  </Typography>

                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      borderLeft: "4px solid #1976d2",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}
                    >
                      ¿Por qué te lo recomendamos?
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {rec.razon}
                    </Typography>
                  </Box>

                  {/* Horarios disponibles */}
                  {rec.horarios_disponibles && rec.horarios_disponibles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: "1rem" }} />
                        Próximos horarios:
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                        {rec.horarios_disponibles.slice(0, 5).map((horario) => (
                          <Box
                            key={horario.id}
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: "#fff",
                              border: "1px solid #e0e0e0",
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: "#f5f5f5",
                                borderColor: "#1976d2",
                              },
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: "600", color: "#1976d2" }}>
                                {horario.dia_texto}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                                <AccessTimeIcon sx={{ fontSize: "0.875rem", color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">
                                  {horario.hora_inicio} - {horario.hora_fin}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, ml: 1 }}>
                                  <PeopleIcon sx={{ fontSize: "0.875rem", color: horario.capacidad <= 3 ? "#d32f2f" : "#2e7d32" }} />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: "bold",
                                      color: horario.capacidad <= 3 ? "#d32f2f" : "#2e7d32",
                                    }}
                                  >
                                    {horario.capacidad}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={reservingSlot === horario.id ? <CircularProgress size={16} color="inherit" /> : <EventAvailableIcon />}
                              onClick={() => handleReserveSlot(rec.id, horario.id, rec.nombre)}
                              disabled={reservingSlot === horario.id || horario.capacidad <= 0}
                              sx={{
                                minWidth: '90px',
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1,
                              }}
                            >
                              {reservingSlot === horario.id ? "..." : "Reservar"}
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewActivity(rec.id)}
                    sx={{ mt: "auto" }}
                  >
                    Ver todos los horarios
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          variant="outlined"
          onClick={fetchRecommendations}
          startIcon={<AutoAwesomeIcon />}
        >
          Actualizar recomendaciones
        </Button>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AIRecommendations;
