tree -a -I 'node_modules|.git|.DS_Store|dist|' "/Users/roro/Documents/Coding Projects/TCora/services"


tree -a -I 'node_modules|.git|.DS_Store' "/Users/roro/Documents/Coding Projects/TCora/apps/tcora-platform"
 

docker exec -it 2016f29392ad ls -la /app/services/api/dist
s
docker exec -it 2016f29392ad find /app -name "app.controller.js"

docker-compose down

docker-compose up --build

# This will stop containers, remove volumes, and start fresh
docker-compose down -v && docker-compose up


# DEBUG SESSION 
docker-compose -f docker-compose.debug.yml down -v
docker-compose -f docker-compose.debug.yml up -d
npm run dev 

