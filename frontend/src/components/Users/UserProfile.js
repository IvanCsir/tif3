import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import PersonIcon from "@mui/icons-material/Person";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import PoolIcon from "@mui/icons-material/Pool";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const PREFERENCIAS_TIPO_OPTIONS = [
  { value: "musculacion", label: "Musculación", icon: <FitnessCenterIcon sx={{ fontSize: 40 }} /> },
  { value: "cardio", label: "Cardio", icon: <DirectionsRunIcon sx={{ fontSize: 40 }} /> },
  { value: "mente-cuerpo", label: "Mente-Cuerpo", icon: <SelfImprovementIcon sx={{ fontSize: 40 }} /> },
  { value: "raqueta", label: "Raqueta", icon: <SportsBaseballIcon sx={{ fontSize: 40 }} /> },
  { value: "acuatico", label: "Acuático", icon: <PoolIcon sx={{ fontSize: 40 }} /> },
  { value: "funcional", label: "Funcional", icon: <AccessibilityNewIcon sx={{ fontSize: 40 }} /> },
];

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [isFirstTime, setIsFirstTime] = useState(false);

  const [formData, setFormData] = useState({
    edad: "",
    nivel_experiencia: "",
    preferencias_tipo: [],
    preferencia_formato: "",
    objetivos: "",
    limitaciones: "",
  });

  useEffect(() => {
    // Verificar si es la primera vez (viene del registro)
    const firstTime = localStorage.getItem("first_time_setup");
    setIsFirstTime(firstTime === "true");
    
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios/preferencias/get_preferencias/?user_id=${usuarioId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        setFormData({
          edad: data.data.edad || "",
          nivel_experiencia: data.data.nivel_experiencia || "",
          preferencias_tipo: data.data.preferencias_tipo
            ? data.data.preferencias_tipo.split(",").map((p) => p.trim())
            : [],
          preferencia_formato: data.data.preferencia_formato || "",
          objetivos: data.data.objetivos || "",
          limitaciones: data.data.limitaciones || "",
        });
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      setAlertMessage("Error: Usuario no identificado");
      setAlertSeverity("error");
      setAlertOpen(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios/preferencias/update_preferencias/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: usuarioId,
            edad: formData.edad,
            nivel_experiencia: formData.nivel_experiencia,
            preferencias_tipo: formData.preferencias_tipo.join(", "),
            preferencia_formato: formData.preferencia_formato,
            objetivos: formData.objetivos,
            limitaciones: formData.limitaciones,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAlertMessage("Preferencias guardadas correctamente");
        setAlertSeverity("success");
        setAlertOpen(true);

        // Si es la primera vez, limpiar el flag y redirigir
        if (isFirstTime) {
          localStorage.removeItem("first_time_setup");
          setTimeout(() => {
            navigate("/actividades");
          }, 2000);
        }
      } else {
        setAlertMessage(data.message || "Error al guardar preferencias");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } catch (error) {
      setAlertMessage("Error al guardar preferencias");
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (isFirstTime) {
      localStorage.removeItem("first_time_setup");
      navigate("/actividades");
    }
  };

  const togglePreferencia = (value) => {
    setFormData((prev) => {
      const current = prev.preferencias_tipo;
      if (current.includes(value)) {
        return {
          ...prev,
          preferencias_tipo: current.filter((p) => p !== value),
        };
      } else {
        return {
          ...prev,
          preferencias_tipo: [...current, value],
        };
      }
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <PersonIcon sx={{ fontSize: 60, color: "#1976d2", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {isFirstTime ? "Configura tu Perfil" : "Mi Perfil"}
          </Typography>
          {isFirstTime && (
            <Typography variant="body1" color="text.secondary">
              Cuéntanos un poco sobre ti para darte mejores recomendaciones
            </Typography>
          )}
        </Box>

        {alertOpen && (
          <Alert
            severity={alertSeverity}
            onClose={() => setAlertOpen(false)}
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Edad"
                type="number"
                value={formData.edad}
                onChange={(e) =>
                  setFormData({ ...formData, edad: e.target.value })
                }
                inputProps={{ min: 10, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Experiencia</InputLabel>
                <Select
                  value={formData.nivel_experiencia}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nivel_experiencia: e.target.value,
                    })
                  }
                  label="Nivel de Experiencia"
                >
                  <MenuItem value="">Sin especificar</MenuItem>
                  <MenuItem value="principiante">Principiante</MenuItem>
                  <MenuItem value="intermedio">Intermedio</MenuItem>
                  <MenuItem value="avanzado">Avanzado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Preferencias de Actividad
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selecciona los tipos de actividades que más te interesan
              </Typography>
              <Grid container spacing={2}>
                {PREFERENCIAS_TIPO_OPTIONS.map((option) => {
                  const isSelected = formData.preferencias_tipo.includes(option.value);
                  return (
                    <Grid item xs={6} sm={4} key={option.value}>
                      <Card
                        onClick={() => togglePreferencia(option.value)}
                        sx={{
                          cursor: "pointer",
                          position: "relative",
                          border: isSelected ? "2px solid #1976d2" : "2px solid #e0e0e0",
                          backgroundColor: isSelected ? "#e3f2fd" : "#fff",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: 3,
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            textAlign: "center",
                            py: 3,
                          }}
                        >
                          {isSelected && (
                            <CheckCircleIcon
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                color: "#1976d2",
                                fontSize: 24,
                              }}
                            />
                          )}
                          <Box sx={{ color: isSelected ? "#1976d2" : "text.secondary" }}>
                            {option.icon}
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{
                              mt: 1,
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected ? "#1976d2" : "text.primary",
                            }}
                          >
                            {option.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Formato Preferido</InputLabel>
                <Select
                  value={formData.preferencia_formato}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferencia_formato: e.target.value,
                    })
                  }
                  label="Formato Preferido"
                >
                  <MenuItem value="">Sin preferencia</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="grupal">Grupal</MenuItem>
                  <MenuItem value="sin_preferencia">Sin preferencia</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Objetivos"
                multiline
                rows={2}
                value={formData.objetivos}
                onChange={(e) =>
                  setFormData({ ...formData, objetivos: e.target.value })
                }
                placeholder="Ej: pérdida de peso, ganar músculo, mejorar resistencia, socializar"
                helperText="Describe tus objetivos con el deporte"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Limitaciones o Precauciones"
                multiline
                rows={2}
                value={formData.limitaciones}
                onChange={(e) =>
                  setFormData({ ...formData, limitaciones: e.target.value })
                }
                placeholder="Ej: problemas de rodilla, alergia al frío, no puede correr"
                helperText="Indica si tienes alguna limitación física o precaución"
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {isFirstTime && (
                  <Button
                    variant="outlined"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    Configurar después
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ ml: isFirstTime ? 0 : "auto" }}
                >
                  {loading ? "Guardando..." : "Guardar Preferencias"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default UserProfile;
