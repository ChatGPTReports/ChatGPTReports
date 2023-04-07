FROM php:8.0-apache

COPY html /var/www/html
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli
#RUN docker-php-ext-install curl && docker-php-ext-enable curl
#RUN apt-get update && apt-get upgrade -y
