#!/bin/bash

# ===============================
# Instalador de Nextcloud con PHP 8.2 + NGINX
# ===============================

set -e
clear
echo "=== INSTALADOR DE NEXTCLOUD CON PHP 8.2 ) ==="

spinner() {
    local pid=$!
    local delay=0.1
    local spinstr='|/-\'
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

read -p "Dominio de Nextcloud (ej: nextcloud.grupX.itb.cat): " NEXTCLOUD_DOMAIN
read -p "IP del servidor (para /etc/hosts en cliente): " SERVER_IP
read -p "Nombre de la base de datos: " DB_NAME
read -p "Nombre del usuario de la base de datos: " DB_USER
read -s -p "Contraseña del usuario de la base de datos: " DB_PASSWORD
echo ""

echo " Eliminando PHP anteriores..."
(sudo apt purge -y 'php8.*' 'php7.*' > /dev/null 2>&1 && sudo apt autoremove -y > /dev/null 2>&1) &
spinner
echo " PHP anterior eliminado."

echo " Actualizando repositorios..."
(sudo apt update -y > /dev/null 2>&1 && sudo apt install -y software-properties-common lsb-release apt-transport-https ca-certificates curl gnupg > /dev/null 2>&1) &
spinner

echo " Añadiendo repositorio PHP 8.2..."
(sudo add-apt-repository ppa:ondrej/php -y > /dev/null 2>&1 && sudo apt update -y > /dev/null 2>&1) &
spinner

echo " Instalando PHP 8.2 y servicios esenciales..."
(sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-zip php8.2-xml php8.2-mbstring php8.2-curl php8.2-gd php8.2-snmp php8.2-imap php8.2-redis php8.2-bcmath php8.2-intl nginx unzip wget certbot python3-certbot-nginx > /dev/null 2>&1) &
spinner
echo " PHP y servicios instalados."

# ===========================================
# Instalación de MariaDB
# ===========================================
echo " Instalando MariaDB..."
(sudo apt install -y mariadb-server > /dev/null 2>&1) &
spinner

echo " Iniciando y habilitando MariaDB..."
(sudo systemctl start mariadb && sudo systemctl enable mariadb > /dev/null 2>&1) &
spinner
echo " MariaDB en funcionamiento."

echo " Configurando base de datos en MariaDB..."
sudo mysql -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
sudo mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo " Base de datos y usuario creados."

echo " Descargando Nextcloud..."
(wget -q https://download.nextcloud.com/server/releases/nextcloud-27.1.2.zip -O /tmp/nextcloud.zip) &
spinner
echo " Nextcloud descargado."

echo " Extrayendo Nextcloud..."
(sudo mkdir -p /var/www && sudo unzip -o -q /tmp/nextcloud.zip -d /var/www/) &
spinner
echo " Nextcloud extraído."

echo " Asignando permisos..."
(sudo chown -R www-data:www-data /var/www/nextcloud && sudo chmod -R 755 /var/www/nextcloud) &
spinner
echo " Permisos aplicados."

echo " Configurando NGINX..."
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo bash -c "cat > /etc/nginx/sites-available/nextcloud <<EOF
server {
    listen 80;
    server_name $NEXTCLOUD_DOMAIN;

    root /var/www/nextcloud;
    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php\$is_args\$args;
    }

    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF"

sudo ln -sf /etc/nginx/sites-available/nextcloud /etc/nginx/sites-enabled/
(sudo nginx -t > /dev/null 2>&1 && sudo systemctl reload nginx) &
spinner
echo " NGINX listo."

echo " Generando certificado SSL..."
(sudo certbot --nginx -d $NEXTCLOUD_DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect > /dev/null 2>&1) &
spinner
echo " Certificado generado."

echo " Ajustando configuración de PHP..."
PHP_INI="/etc/php/8.2/fpm/php.ini"
if [ ! -f "$PHP_INI" ]; then
    echo " ERROR: No se encuentra $PHP_INI. Verifica que PHP 8.2 esté instalado."
    exit 1
fi
sudo sed -i "s/upload_max_filesize = .*/upload_max_filesize = 512M/" $PHP_INI
sudo sed -i "s/post_max_size = .*/post_max_size = 512M/" $PHP_INI
sudo sed -i "s/memory_limit = .*/memory_limit = 512M/" $PHP_INI
sudo systemctl restart php8.2-fpm

echo " Configurando cron de Nextcloud..."
(sudo crontab -u www-data -l 2>/dev/null | grep -q "cron.php" || echo "*/5 * * * * php -f /var/www/nextcloud/cron.php" | sudo crontab -u www-data -) &
spinner

echo ""
echo " INSTALACIÓN COMPLETA"
echo " Accede desde: https://$NEXTCLOUD_DOMAIN"
echo ""
echo " En la interfaz, crea un usuario admin y usa:"
echo "  ▸ Base de datos: $DB_NAME"
echo "  ▸ Usuario: $DB_USER"
echo "  ▸ Contraseña: (la indicada)"
echo "  ▸ Servidor BBDD: localhost"
echo ""
echo " Si es una red local, añade en cliente:"
echo "  $SERVER_IP    $NEXTCLOUD_DOMAIN"