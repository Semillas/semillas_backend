web: NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program gunicorn config.wsgi:application
daphne: daphne -b 0.0.0.0 -p 8001 chat.asgi:channel_layer -v2
worker: python manage.py runworker --settings config.settings.chat -v2
