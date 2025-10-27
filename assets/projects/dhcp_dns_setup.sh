#!/bin/bash

# 🎨 Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BLUE='\033[1;34m'
NC='\033[0m'

# ✅ Verificar root
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}❌ Este script debe ejecutarse como root.${NC}"
  exit 1
fi

# Título
echo -e "${PURPLE}=================================================${NC}"
echo -e "${PURPLE}🚀 CONFIGURACIÓN AUTOMÁTICA DE SERVIDOR DHCP + DNS 🚀${NC}"
echo -e "${PURPLE}=================================================${NC}"

# Detectar interfaces
echo -e "${YELLOW}🔍 Detectando interfaces de red disponibles...${NC}"
interfaces=($(ls /sys/class/net | grep -v lo))

if [ ${#interfaces[@]} -lt 2 ]; then
  echo -e "${RED}❌ Se requieren al menos 2 interfaces de red.${NC}"
  exit 1
fi

# Mostrar interfaces
echo -e "${GREEN}Interfaces detectadas:${NC}"
for i in "${!interfaces[@]}"; do
  echo -e "  ${i}) ${interfaces[$i]}"
done

# Elegir interfaz externa (internet)
read -p "$(echo -e ${YELLOW}👉 Selecciona el número de la interfaz conectada a internet: ${NC})" ext_idx
EXT_IF="${interfaces[$ext_idx]}"

# Elegir interfaz interna
read -p "$(echo -e ${YELLOW}👉 Selecciona el número de la interfaz interna (LAN): ${NC})" int_idx
INT_IF="${interfaces[$int_idx]}"

# Pedir IP y DNS
read -p "$(echo -e ${YELLOW}👉 IP fija para la red interna (ej: 192.168.50.1/24): ${NC})" IP_INTERNA
read -p "$(echo -e ${YELLOW}👉 DNS primario (puede ser 8.8.8.8 o tu IP interna): ${NC})" DNS_SERVER

# Configurar Netplan
echo -e "${BLUE}🛠️ Configurando Netplan...${NC}"
NETPLAN_FILE="/etc/netplan/01-dhcp-dns.yaml"

cat > $NETPLAN_FILE <<EOF
network:
  version: 2
  ethernets:
    $EXT_IF:
      dhcp4: true
    $INT_IF:
      dhcp4: false
      addresses:
        - $IP_INTERNA
      nameservers:
        addresses:
          - $DNS_SERVER
      routes:
        - to: 0.0.0.0/0
          via: ${IP_INTERNA%/*}
EOF

netplan apply && echo -e "${GREEN}✅ Netplan aplicado.${NC}" || {
  echo -e "${RED}❌ Error aplicando Netplan.${NC}"
  exit 1
}

# Obtener datos para DHCP y DNS
read -p "$(echo -e ${YELLOW}👉 Rango DHCP inicio (ej: 192.168.50.100): ${NC})" DHCP_START
read -p "$(echo -e ${YELLOW}👉 Rango DHCP fin (ej: 192.168.50.200): ${NC})" DHCP_END
read -p "$(echo -e ${YELLOW}👉 Máscara de red (ej: 255.255.255.0): ${NC})" NETMASK
read -p "$(echo -e ${YELLOW}👉 Dirección de red (ej: 192.168.50.0): ${NC})" NETWORK
read -p "$(echo -e ${YELLOW}👉 Dominio (ej: empresa.local): ${NC})" DOMAIN
read -p "$(echo -e ${YELLOW}👉 Zona DNS (ej: empresa.local): ${NC})" ZONE
read -p "$(echo -e ${YELLOW}👉 Zona inversa (ej: 50.168.192.in-addr.arpa): ${NC})" REV_ZONE
read -p "$(echo -e ${YELLOW}👉 Hostname del servidor DNS (ej: dns1): ${NC})" DNS_HOST

# Instalar servicios
echo -e "${BLUE}📦 Instalando BIND9 y DHCP Server...${NC}"
apt update && apt install -y isc-dhcp-server bind9 bind9utils bind9-doc

# Configurar DHCP
echo -e "${BLUE}🧾 Configurando /etc/dhcp/dhcpd.conf...${NC}"
cat > /etc/dhcp/dhcpd.conf <<EOF
option domain-name "$DOMAIN";
option domain-name-servers $IP_INTERNA;
default-lease-time 600;
max-lease-time 7200;
authoritative;

subnet $NETWORK netmask $NETMASK {
  range $DHCP_START $DHCP_END;
  option routers ${IP_INTERNA%/*};
  option subnet-mask $NETMASK;
  option broadcast-address ${NETWORK%.*}.255;
}
EOF

echo "INTERFACESv4=\"$INT_IF\"" > /etc/default/isc-dhcp-server

# Configurar BIND9
echo -e "${BLUE}🧾 Configurando BIND9...${NC}"

cat > /etc/bind/named.conf.local <<EOF
zone "$ZONE" {
  type master;
  file "/etc/bind/db.$ZONE";
  allow-update { none; };
};

zone "$REV_ZONE" {
  type master;
  file "/etc/bind/db.$REV_ZONE";
  allow-update { none; };
};
EOF

cp /etc/bind/db.local /etc/bind/db.$ZONE
sed -i "s/localhost./$DNS_HOST.$ZONE./" /etc/bind/db.$ZONE
sed -i "s/127.0.0.1/$IP_INTERNA/" /etc/bind/db.$ZONE
echo -e "\nwww\tIN\tA\t$IP_INTERNA" >> /etc/bind/db.$ZONE

cp /etc/bind/db.127 /etc/bind/db.$REV_ZONE
sed -i "s/localhost./$DNS_HOST.$ZONE./" /etc/bind/db.$REV_ZONE
sed -i "s/1.0.0/$REV_ZONE/" /etc/bind/db.$REV_ZONE
echo -e "\n$(echo $IP_INTERNA | awk -F. '{print $4}')\tIN\tPTR\t$DNS_HOST.$ZONE." >> /etc/bind/db.$REV_ZONE

# Configurar named.conf.options
cat > /etc/bind/named.conf.options <<EOF
options {
  directory "/var/cache/bind";

  allow-query { localhost; $NETWORK/24; };

  recursion yes;
  forwarders {
    8.8.8.8;
  };

  dnssec-validation auto;
  listen-on-v6 { any; };
};
EOF

# Verificar BIND9
echo -e "${YELLOW}🔍 Verificando configuración DNS...${NC}"
named-checkconf || { echo -e "${RED}❌ Error en configuración BIND9.${NC}"; exit 1; }

# Reiniciar servicios
echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
systemctl restart isc-dhcp-server
systemctl restart bind9
systemctl enable isc-dhcp-server
systemctl enable bind9

# Final
echo -e "${GREEN}🎉 Configuración completada exitosamente.${NC}"
echo -e "${GREEN}✅ DHCP en $INT_IF — rango: $DHCP_START a $DHCP_END${NC}"
echo -e "${GREEN}✅ DNS sirviendo zona $ZONE desde $IP_INTERNA${NC}"
echo -e "${PURPLE}=================================================${NC}"