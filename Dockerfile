FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html dashboard.html bookings.html admin.html Profile.html ./
COPY js/ ./js/
COPY css/ ./css/
EXPOSE 80
