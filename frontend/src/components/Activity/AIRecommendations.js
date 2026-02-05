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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OutdoorGrillIcon from "@mui/icons-material/OutdoorGrill";
import HomeIcon from "@mui/icons-material/Home";
import API_BASE_URL from "../../config/api";

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [provider, setProvider] = useState("fallback");

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

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewActivity(rec.id)}
                    sx={{ mt: "auto" }}
                  >
                    Ver horarios disponibles
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
    </Container>
  );
};

export default AIRecommendations;
