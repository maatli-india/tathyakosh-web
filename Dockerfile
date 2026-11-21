# Runtime image only. deploy-ui-ec2.yml runs `npm run build` on the x64 runner and
# this arm64 image just copies dist/, so no build step runs under emulation.
FROM nginx:alpine

# A template: the nginx:alpine entrypoint envsubsts ${API_BASE_URL} (passed by the deploy) into conf.d/default.conf.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html

EXPOSE 80
