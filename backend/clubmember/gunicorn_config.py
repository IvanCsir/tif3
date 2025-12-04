# Configuración de Gunicorn optimizada para Render (plan gratuito con 512MB RAM)
import os

# Reducir el número de workers para usar menos memoria
workers = 1

# Tipo de worker - sync es el más eficiente en memoria
worker_class = 'sync'

# Threads por worker para manejar múltiples requests sin usar más memoria
threads = 2

# Timeout más largo para operaciones como envío de emails
timeout = 120

# Número de requests por worker antes de reiniciar (previene memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Bind - usar el puerto que Render proporciona
port = os.environ.get('PORT', '10000')
bind = f"0.0.0.0:{port}"

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Graceful timeout
graceful_timeout = 30

# Keep alive
keepalive = 5
