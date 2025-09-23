@echo off
echo Iniciando servidor Angular com proxy...
ng serve --proxy-config proxy.conf.json --host 0.0.0.0 --port 4200
pause
