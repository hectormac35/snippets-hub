
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
ENV NODE_ENV=production
EXPOSE 5000
CMD ["sh","-c","if [ -d prisma/migrations ] && [ \"$(ls -A prisma/migrations 2>/dev/null)\" ]; then \
  npx prisma migrate deploy; \
else \
  echo 'No migrations found, running prisma db push'; \
  npx prisma db push; \
fi && node src/server.js"]

